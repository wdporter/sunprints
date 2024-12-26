const getDB = require("../integration/dbFactory.js")
const OrderDao = require("../integration/OrderDAO.js")
const CustomerDao = require("../integration/CustomerDAO.js")
const OrderProductDao = require("../integration/OrderProductDAO.js")

const OrderModel = require("../models/order.js")

const productService = require("./productService.js")
const customerService = require("./customerServiceDeprecated.js")
const auditLogService = require("./auditLogService.js")
const SalesHistoryService = require("./SalesHistoryService.js")

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

	return new OrderModel()

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

	// save the products separately
	// if (! order.products || order.products.length == 0){
	// 	errors.push("We require at least one product")
	// }

	// check unique order number
	const orderDao = new OrderDao(db)
	const existing = orderDao.getByOrderNumber(order.OrderNumber) 
	if (existing) {
		if (order.OrderId == 0) {
			// we found the order number, but this is a new order, so it's an error
			errors.push(`We require a unique order number. "${existing.orderNumber}" is already in use.`)
		}
		else {
			// we found the order number, so make sure it's on the same order id
			if (existing.OrderId != order.OrderId) // should be the same
				errors.push(`We require a unique order number. "${order.orderNumber}" is already in use.`)
		}
	} // the order number is not in the database so that's fine


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
 *
 * @param {object} order the new order
 * @param {object} designs property names for the OrderGarment table and values
 * @param {string} user the name of the user to record in CreatedBy field
 * @returns {object} savedOrder: the same order with the new OrderId and audit columns and full audit info; errors: an array of error messages
 */
function createNew(order, designs, user) {

	const db = getDB()

	try {
		// 0. validation
		const errors = validate(order, db)
		if (errors.length > 0) {
			return {savedOrder: null, errors}
		}

		const orderDao = new OrderDao(db)

		const now = new Date().toLocaleString()
		order.CreatedBy = order.LastModifiedBy = user
		order.CreatedDateTime = order.LastModifiedDateTime = now

		db.prepare("BEGIN TRANSACTION").run()

		// 1. INSERT Orders
		for (let key in order) {
			// remove default values, no point saving them
			if (order[key] === null)
				delete order[key];
			if (order[key] === 0)
				delete order[key];
			if (order[key] === "")
				delete order[key];
			if (order[key] === false)
				delete order[key];
			if (order[key] === true)
				order[key] = 1;
		}

		let savedOrder = orderDao.insert(order)

		// 2. AuditLog Orders INSERT
		// this is done by the DAO

		// 3. INSERT Sales History tables
		const salesHistoryService = new SalesHistoryService(db);
		salesHistoryService.saveOrder(savedOrder);

		// 4. filter out any products that have both added:true and removed:true
		order.products = order.products.filter(p => !(p.added && p.removed))

		//5. put designs into first product
		locations.forEach(location => {
			decorations.forEach(decoration => {

				if (designs[`${location}${decoration}DesignId`])
					order.products[0][`${location}${decoration}DesignId`] = designs[`${location}${decoration}DesignId`]

				const medium = media[decorations.indexOf(decoration)]
				if (designs[`${location}${medium}1Id`])
					order.products[0][`${location}${medium}Id`] = designs[`${location}${medium}1Id`]
				if (designs[`${location}${medium}2Id`])
					order.products[0][`${location}${medium}2Id`] = designs[`${location}${medium}2Id`]
			})
		})

		// 5.5 iterate products and save them
		order.products.forEach(product => {
			// tidy up our product
			for (let key in product) {
				if (key.startsWith("Min") || key.startsWith("Qty")) // these were part of the stock warnings
					delete product[key]

				if (!product[key])
					delete product[key] // we don't insert nulls, zeros or empty strings
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
			delete product.added // this is only relevant when editing

			const sizeCategory = product.SizeCategory //might need this
			delete product.SizeCategory

			//6. INSERT product , 
			const orderProductDao = new OrderProductDao(db)
			product.OrderGarmentId = orderProductDao.insert(product)

			// 7. AuditLog OrderGarment INSERT 
			// this is done from DAO

			// 8. INSERT Sales History
			salesHistoryService.saveProduct(product)

			// 9. UPDATE Garment (that is, by reducing the stock level)
			product.SizeCategory = sizeCategory
			productService.reduceStockLevels(db, product, user, now)

			// 10. AuditLog UPDATE Garment 
			// this is done by productService.reduceStockLevels

		})

		db.prepare("COMMIT").run()

		savedOrder = db.prepare("SELECT * FROM Orders WHERE OrderId=?").get(savedOrder.OrderId)
		// convert boolean numbers to true/false
		savedOrder.Repeat = !!savedOrder.Repeat
		savedOrder.New = !!savedOrder.New
		savedOrder.BuyIn = !!savedOrder.BuyIn
		savedOrder.Done = !!savedOrder.Done
		savedOrder.Deleted = !!savedOrder.Deleted
		// the client should refetch products separately



		return {
			errors,
			savedOrder,
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


/** edit an order
 * 
 * @see validate make sure you call validate first, we will throw exceptions here
 * @param {object} order an order object that has the new values for its properties
 * @param {object} designs property names for the OrderGarment table and values, goes in the first product
 * @param {string} user the name of the user to record in LastModifiedBy field
 * @returns {object} savedOrder: the same order audit columns updated; errors: an array of error messages
*/


// for each product

// 	8. if the product is deleted
// 		8a. DELETE OrderGarment
// 		8b. AuditLog OrderGarment DELETE
// 		8c. DELETE Sales
// 		8d. UPDATE Garment (increase stock level)
// 		8e. AuditLog UPDATE Garment
// 	9. Check Diffs.
// 		if there are no diffs, continue loop	
// 	10. if the product is changed:
// 		10a. UPDATE OrderGarment
// 		10b. AuditLog OrderGarment UPDATE
// 		10c. UPDATE Sales
// 		10d. UPDATE OrderGarment (reduce stock levels)
// 		10e. AuditLog UPDATE OrderGarment
// end each product
// 11. update last modified by, last modified date time
// 12. return savedOrder

/**
 * updates an existing order
 * @param {*} order the order with the new values
 * @param {*} designs the designs that are on the order
 * @param {*} user the user name who made the save
 * @returns 
 */
function edit(order, designs, user) {

	const db = getDB()

	try {

		//******** 1. validation
		const errors = validate(order, db)
		if (errors.length > 0) {
			return {savedOrder: null, errors}
		}

		//******** 2. UPDATE changes to order
		const orderDao = new OrderDao(db)
		order.Repeat = order.Repeat ? 1 : 0 // convert true/false to 1/0
		order.New = order.New ? 1 : 0
		order.BuyIn = order.BuyIn ? 1 : 0
		order.Done = order.Done ? 1 : 0
		order.Deleted = order.Deleted ? 1 : 0

		db.prepare("BEGIN TRANSACTION").run()

		const updatedOrder = orderDao.update(order, user) // 

		//******************** 2A. update SalesTotal table for sales history */
		const salesHistoryService = new SalesHistoryService(db);
		if (updatedOrder !== null) {
			salesHistoryService.updateOrder(updatedOrder ?? order);
		}


		//******** 3. add our designs to our first non-removed product 
		let index = order.products.findIndex(p => !p.removed)
		if (index > -1) {
			locations.forEach(location => {
				decorations.forEach(decoration => {
					if (designs[`${location}${decoration}DesignId`])
						order.products[index][`${location}${decoration}DesignId`] = designs[`${location}${decoration}DesignId`]
					const medium = media[decorations.indexOf(decoration)]
					if (designs[`${location}${medium}1Id`])
						order.products[index][`${location}${medium}Id`] = designs[`${location}${medium}1Id`]
					if (designs[`${location}${medium}2Id`])
						order.products[index][`${location}${medium}2Id`] = designs[`${location}${medium}2Id`]
				})
			})
		}

		const orderProductDao = new OrderProductDao(db)

		//******** 4. Iterate our products (OrderGarment) and save each one
		for (const product of order.products) {

			//******** 5. If the user added it and removed it, we don't need to save it
			if (product.added && product.removed)
				return 

			// foreign key
			product.OrderId = order.OrderId

			// tidy up our product, remove properties that don't get saved to db
			for (let key in product) {
				if (key.startsWith("Min") || key.startsWith("Qty")) // these were used by front end for stock warnings
					delete product[key]
			}
			// remove garment details if any
			delete product.Code
			delete product.Colour
			delete product.Label
			delete product.Type
			delete product.GarmentNotes
			delete product.Notes

			const sizeCategory = product.SizeCategory // save it for later
			delete product.SizeCategory

			if (product.added) {
				//******** 6. insert into database

				// audit values
				product.CreatedBy = product.LastModifiedBy = user
				product.CreatedDateTime = product.LastModifiedDateTime = new Date().toLocaleString()
				for (let key in product) {
					// remove default values, no point saving them
					if (product[key] == null)
						delete product[key]
					if (product[key] === 0)
						delete product[key]
					if (product[key] === "")
						delete product[key]
				}
				delete product.added

				// **** 6a. INSERT OrderGarment, 
				product.OrderGarmentId = orderProductDao.insert(product)

				// **** 6b. AuditLog OrderGarment INSERT 
				// this is done by orderProductDao.insert, but maybe there's a better way

				// **** 6c  INSERT Sales History (Sales table)
				salesHistoryService.saveProduct(product);

				// **** 6d. UPDATE Garment (reduce stock level)
				product.SizeCategory = sizeCategory
				productService.reduceStockLevels(db, product, user, product.CreatedDateTime)

				// **** 6e. AuditLog UPDATE Garment
				// this will be done from DAO
			}
			else if (product.removed) {
				// ******** 7 delete from database

				product.LastModifiedBy = user
				product.LastModifiedDateTime = new Date().toLocaleString()

				// **** 7a. DELETE OrderGarment
				orderProductDao.delete(product)

				// **** 7b. AuditLog OrderGarment DELETE, done by DAO
				// **** 7c. DELETE from Sales for sales history
				salesHistoryService.deleteOrderProduct(product);
				
				// **** 7d. UPDATE Garment (increase stock level)
				product.SizeCategory = sizeCategory
				productService.increaseStockLevels(db, product, user, product.LastModifiedDateTime)

				// **** 7e. AuditLog UPDATE Garment, done by DAO

			}
			else {
				// ******** 8 update database, if there are diffs

				delete product.added
				delete product.removed

				const originalOrderProduct = orderProductDao.get(product.OrderGarmentId)

				// save updated details
				orderProductDao.update(product, user)

				// save updated product to sales history
				salesHistoryService.updateOrderProduct(product);

				product.LastModifiedBy = user;
				productService.adjustStockLevels(db, originalOrderProduct, product);
			}
		} //~ for (const product of order.products)

		db.prepare("COMMIT").run()

		const ret = {
			LastModifiedBy: order.LastModifiedBy,
			LastModifiedDateTime: order.LastModifiedDateTime
		}
		return { savedOrder: ret, errors}

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



module.exports = { get, getNew, validate, createNew, edit }