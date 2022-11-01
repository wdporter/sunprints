const getDB = require("../integration/dbFactory")
const OrderDao = require("../integration/OrderDAO.js")
const CustomerDao = require("../integration/CustomerDAO.js")
const OrderProductDao = require("../integration/OrderProductDAO.js")

const OrderModel = require("../models/order.js")

const productService = require("./productService.js")
const customerService = require("./customerService.js")
const purchaseOrderService = require("./purchaseOrderService.js")
const auditLogService = require("./auditLogService.js")
const salesHistoryService = require("./salesHistoryService.js")

const { art, locations, decorations, media } = require("../config/art.js")


function get(orderId) {

	const db = getDB()

	try {
		let dao = new OrderDao(db)
		const orderObj = dao.get(orderId)
		if (!orderObj)
			throw Error(`We can't find an order with id: ${orderId}`)

		// convert boolean numbers to true/false
		orderObj.Repeat = !!orderObj.Repeat
		orderObj.New = !!orderObj.New
		orderObj.BuyIn = !!orderObj.BuyIn
		orderObj.Done = !!orderObj.Done
		orderObj.Deleted = !!orderObj.Deleted

		const retVal = new OrderModel(orderObj)

		const productsObj = productService.getProductsForOrder(retVal.OrderId, db)
		retVal.products = productsObj.products
		retVal.designs = productsObj.designs

		// now get our customer
		dao = new CustomerDao(db)
		const customer = dao.get(retVal.CustomerId)

		if (customer == null)
			throw Error("this order has an invalid customer id")

		retVal.customer = {
			CustomerId: customer.CustomerId,
			Code: customer.Code,
			Company: customer.Company,
			detailsString: customerService.getDetailsString(customer)
		}

		return retVal

	}

	finally {
		db.close()
	}

}


function getNew() {

	const retVal = {
		order: new OrderModel(),
		purchaseOrders: purchaseOrderService.getOutstanding()
	}
	return retVal

}


/**
 * Validates an order, making sure there is an orderid and a sales rep
 * if it's an new order, checks the order number doesn't already exist
 * @param {object} order 
 * @param {Database} db 
 * @returns an array of errors, or if ok, an empty array
 */
function validate(order, db) {

	const errors = []

	if (!order.OrderNumber)
		errors.push("We require an order number")
	if (!order.SalesRep)
		errors.push("We require a sales rep")
	if (!order.OrderDate) {
		errors.push("We require an order date")
	}
	if (! order.products || order.products.length == 0){
		errors.push("We require at least one product")
	}


	// check unique order number
	const orderDao = new  OrderDao(db)
	const existing = orderDao.getByOrderNumber(order.OrderNumber)
	if (order.OrderId == 0) {
		// it's new, so make sure we don't a have a duplicated order number
		if (existing) // should be null
			errors.push(`We require a unique order number. "${order.orderNumber}" is already in use.`)
	}
	else {
		// it's an update, if the order number belongs to a different order id, it is invalid
		if (existing.OrderId != order.OrderId) // should be the same
			errors.push(`We require a unique order number. "${order.orderNumber}" is already in use.`)
	}


	return errors
}

/** Creates a new Order
 * 0. Validation
 * 1. INSERT Orders
 * 2. AuditLog Orders INSERT  
 * 3. INSERT Sales History 
 * 4. filter out any products that have both added:true and removed:true
 * 5. put designs into first product 
 * for each product
 *    6. INSERT OrderGarment
 *    7. AuditLog OrderGarment INSERT 
 *    8. INSERT Sales History
 *    9. UPDATE Garment (reduce stock level)
 *    10. AuditLog UPDATE Garment 
 * end each product
 * 
 * @see validate make sure you call validate first, we will throw exceptions here
 * @param {object} order the new order
 * @param {object} designs the designs to be added to the first product
 * @returns {object} savedOrder: the same order with the new OrderId and audit columns and full audit info; errors: an array of error messages
 */


function createNew(order, designs, user) {

	const db = getDB()

	try {
		// 0. validation
		const errors = validate(order, db)
		if (errors.length > 0) {
			return { errors }
		}

		const orderDao = new  OrderDao(db)

		const now = new Date().toLocaleString()
		order.CreatedBy = order.LastModifiedBy = user
		order.CreatedDateTime = order.LastModifiedDateTime = now

		db.prepare("BEGIN TRANSACTION").run()

		// 1. INSERT Orders
		for (let key in order ) {
			// remove default values, no point saving them
			if (order[key] == null)
				delete order[key]
			if (order[key]=== 0)
				delete order[key]
			if (order[key] === "")
				delete order[key]
			if (order[key] === false)
				delete order[key]
			if (order[key] === true)
				order[key] = 1
		}

		let savedOrder = orderDao.insert(order)

		// 2. AuditLog Orders INSERT
		// this is done by the DAO

		// 3. INSERT Sales History 
		salesHistoryService.insertOrder(db, savedOrder)

		// 4. filter out any products that have both added:true and removed:true
		order.products = order.products.filter(p => !(p.added && p.removed))

		//5. put designs into first product
		locations.forEach(location => {
			decorations.forEach(decoration => {
				
				if (designs[`${location}${decoration}DesignId`])
					order.products[0][`${location}${decoration}DesignId`] = designs[`${location}${decoration}DesignId`]
				
				const medium = media[decorations.indexOf(decoration)]
				if (designs[`${location}${medium}1Id`])
					order.products[0][`${location}${medium}Id` ] = designs[`${location}${medium}1Id`]
				if (designs[`${location}${medium}2Id`])
					order.products[0][`${location}${medium}2Id`] = designs[`${location}${medium}2Id`]
			})
		})

		//iterate products and save them
		order.products.forEach(product => {
			// tidy up our product
			for (let key in product) {
				if (key.startsWith("Min") || key.startsWith("Qty")) // these were part of the stock warnings
					delete product[key]

				if (!product[key])
					delete product[key] // we don't insert nulls
			}

			// audit values
			product.CreatedBy = product.LastModifiedBy = user
			product.CreatedDateTime = product.LastModifiedDateTime = now
			// foreign key
			product.OrderId = savedOrder.OrderId
			
			// remove garment details if any
			delete product.Code
			delete product.Colour
			delete product.Label
			delete product.Type
			delete product.GarmentNotes
			delete product.Notes
			delete product.added // this is only used when editing
			
			const sizeCategory = product.SizeCategory //might need this
			delete product.SizeCategory 
	
				
			//6. INSERT product 
			const orderProductDao = new OrderProductDao(db)
			product.OrderGarmentId = orderProductDao.insert(product)

			// 7. AuditLog OrderGarment INSERT 
			// do this from dao

			// 8. INSERT Sales History
			salesHistoryService.insertProduct(db, product)

			// 9. UPDATE Garment (reduce stock level)
			product.SizeCategory = sizeCategory
			productService.reduceStockLevels(db, product, user, now)
			
			// 10. AuditLog UPDATE Garment 
			// this is done by productService.reduceStockLevels

		})
		
		


		db.prepare("COMMIT").run()

		//todo refetch the products also and put them in return value

		return {
			errors, 
			savedOrder, // has the orderid and audit columns filled in
			// , audit columns
		}
	}
	catch (ex) {
		if (db.inTransaction)
			db.prepare("ROLLBACK").run()
		
		throw ex
	}
	finally {
		db.close()
	}



}

module.exports = { get, getNew, validate, createNew }