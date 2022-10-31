const getDB = require("../integration/dbFactory.js")
const ProductDao = require("../integration/ProductDAO.js")
const PurchaseOrderProductDAO = require("../integration/PurchaseOrderProductDAO.js")
const { art, locations, decorations } = require("../config/art.js")

function search (terms) {

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
		return({
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

	const mustClose = false
	
	if (!db) {
		db = getDB()
		mustClose = true
	}

	try {
		// now populate our products
		dao = new ProductDao(db)
		const products = dao.getByOrderId(orderId)

		products.forEach(product => {
			product.added = false
			product.removed = false
		})

		// move our designs from products[0] into "designs" property
		const designs = {}
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
		const retVal = stockOrderGarmentDao.getPurchaseOrderProducts(stockOrderId)

		return retVal 
}
finally {
	db.close()
}
}

module.exports = { search, getProductsForOrder, getStockOrderProducts }
