const getDB = require("../integration/dbFactory.js")
const ProductDao = require("../integration/ProductDAO.js")
const PurchaseOrderProductDAO = require("../integration/PurchaseOrderProductDAO.js")
const AuditLogDao = require("../integration/AuditLogDAO.js")
const OrderGarment = require("../models/ordergarment.js")
const OrderProductDao = require("../integration/OrderProductDAO")
const { art, locations, decorations } = require("../config/art.js")
const { allSizes, sizes } = require("../config/sizes.js")

function search(terms) {

	const { code, label, type, colour } = terms

	if (code == "" && label == "" && type == "" && colour == "")
		return []

	if (code == "")
		delete terms.code
	if (label == "")
		delete terms.label
	if (type == "")
		delete terms.type
	if (colour == "")
		delete terms.colour

	const db = getDB()

	try {
		const productDao = new ProductDao(db)

		const LIMIT = 50
		let data = productDao.search(terms)
		return ({
			totalRecords: data.length,
			data: data.slice(0, LIMIT),
			limit: LIMIT
		})

	}
	finally {
		db.close()
	}
}


function getProductsForOrder(orderId, db) {

	let mustClose = false

	if (!db) {
		db = getDB()
		mustClose = true
	}

	try {
		// now populate our products
		dao = new ProductDao(db)
		let products = dao.getByOrderId(orderId)

		products.forEach(product => {
			product.added = false
			product.removed = false
		})

			// move our designs from products[0] into "designs" property
			let designs = {}
		if (products.length > 0) {
			for (location of locations) {
				for (design of art) {
					designs[`${location}${design.decoration}DesignId`] = products[0][`${location}${design.decoration}DesignId`]
					designs[`${location}${design.decoration}DesignName`] = products[0][`${location}${design.decoration}DesignName`]

					// the order page ignores these
					products.forEach(product => {
						delete product[`${location}${design.decoration}DesignId`]
						delete product[`${location}${design.decoration}DesignName`]
					})

					// media
					for (position of [1, 2]) {
						designs[`${location}${design.medium}${position}Id`] = products[0][`${location}${design.medium}${position}Id`]
						designs[`${location}${design.medium}${position}Name`] = products[0][`${location}${design.medium}${position}Name`]

						// the order page ignores these
						products.forEach(product => {
							delete product[`${location}${design.medium}${position}Id`]
							delete product[`${location}${design.medium}${position}Name`]
						})
					}
				}
			}

			// trim names and delete if (standard) -- this is an artefact of the db query
			for (design in designs) {
				if (typeof designs[design] == "string") {
					designs[design] = designs[design].trim()
					if (designs[design] == "(standard)")
						designs[design] = null
				}
			}
		}
		
		return { products, designs }
	}
	finally {
		if (mustClose)
			db.close()
	}

}

function getStockOrderProducts(stockOrderId) {
	const db = getDB()
	try {
		const stockOrderGarmentDao = new PurchaseOrderProductDAO(db)
		const purchaseOrderProducts = stockOrderGarmentDao.getPurchaseOrderProducts(stockOrderId)

		const retVal = purchaseOrderProducts.map(po => {
			const orderProduct = new OrderGarment()
			orderProduct.GarmentId = po.GarmentId
			allSizes.forEach(sz => orderProduct[sz] = po[sz] )
			orderProduct.Code = po.Code
			orderProduct.Label = po.Label
			orderProduct.Type = po.Type
			orderProduct.Colour = po.Colour
			orderProduct.Notes = po.Notes
			orderProduct.SizeCategory = po.SizeCategory

			return orderProduct
		})

		return retVal
	}
	finally {
		db.close()
	}
}


/**
 * a new order has a product, so stock levels must be reduced by that amount
 * audit logging is done here
 * @param {Database} db a db connection
 * @param {object} product 
 * @param {user} name name for LastModifiedBy
 * @param {date} date date for LastModifiedDateTime
 */
function reduceStockLevels(db, product, user, date) {
	const items = {}
	sizes[product.SizeCategory].forEach(size => {
		if (product[size] > 0) {
			items[size] = product[size]
		}
	})

	if (Object.keys(items).length > 0) // check, because the do sometimes save with no amounts
	{

		const dao = new ProductDao(db)

		//use the original garment to update audit log
		const original = dao.get(product.GarmentId)

		dao.reduceStockLevels(items, product)

		// items was holding the quantities from the order
		// but we'll reuse it here by changing the figures to the stock balance
		Object.keys(items).forEach(key => {
			items[key] = original[key] - items[key]
		})

		// make our items object look like a Garment for the sake of the audit logs
		items.GarmentId = product.GarmentId
		items.LastModifiedBy = user
		items.LastModifiedDateTime = date

		new AuditLogDao(db).update("Garment", "GarmentId", original, items)

	}

}


/**
 * an order has a product removed, so stock levels must be increased (they were reduced when created)
 * audit logging is done here
 * @param {Database} db a db connection
 * @param {object} product 
 * @param {user} name name for LastModifiedBy
 * @param {date} date date for LastModifiedDateTime
 */
function increaseStockLevels(db, product, user, date) {
	const items = {}
	allSizes.forEach(size => {
		items[size] = product[size] ?? 0
	})

		const dao = new ProductDao(db)

		//use the original garment to update audit log
		const original = dao.get(product.GarmentId)

		dao.increaseStockLevels(items, product)

		// items was holding the quantities from the order
		// but we'll reuse it here by changing the figures to the stock balance
		Object.keys(items).forEach(key => {
			items[key] = original[key] + items[key]
		})

		// make our items object look like a Garment for the sake of the audit logs
		items.GarmentId = product.GarmentId
		items.LastModifiedBy = user
		items.LastModifiedDateTime = date

		new AuditLogDao(db).update("Garment", "GarmentId", original, items)


}



/**
 * an order has a product updated, so stock levels must be either increased or decreased based on changes
 * make sure your "product" (OrderGarment) has LastModifiedBy set
 * audit logging is done here
 * @param {Database} db a db connection
 * @param {object} originalOrderProduct the OrderGarment object before it was updated with new stock level
 * @param {object} product an OrderGarment object that has updated stock levels in it
 */
function adjustStockLevels(db, originalOrderProduct, product) {

		const dao = new OrderProductDao(db)


		const productDao = new ProductDao(db)
		productDao.adjustStockLevels(originalOrderProduct, product) 

}



module.exports = { search, getProductsForOrder, getStockOrderProducts, reduceStockLevels, increaseStockLevels, adjustStockLevels }
