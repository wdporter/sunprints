const getDB = require("../integration/dbFactory")
const OrderDao = require("../integration/OrderDAO.js")
const ProductDao = require("../integration/ProductDAO.js")
const OrderModel = require("../models/order.js")
const CustomerDao = require("../integration/CustomerDAO.js")
const customerService = require("./customerService.js")
const art = require("../config/art.js")
const auditing = require("../config/auditColumns.js")



function get (orderId) {
	
	const db = getDB()

	try {
		let dao = new OrderDao(db)
		const orderObj = dao.get(orderId)
		if (!orderObj)
			throw Error (`We can't find an order with id: ${orderId}`)

		// convert boolean numbers to true/false
		orderObj.Repeat = !!orderObj.Repeat
		orderObj.New = !!orderObj.New
		orderObj.BuyIn = !!orderObj.BuyIn
		orderObj.Done = !!orderObj.Done
		orderObj.Deleted = !!orderObj.Deleted
		
		const retVal = new OrderModel(orderObj)

		// now populate our products
		dao = new ProductDao(db)
		const products = dao.getByOrderId(orderId)

		products.forEach(product => {
			art.locations.forEach(location => {
				// the query sets  screen names to "(standard)" if their name field is empty
				// but that isn't right if the ${location}Screen${pos}Id was actually null 
				// todo can we put an ifnull into the query ?
				[1,2].forEach(pos => {
				if ((product[`${location}Screen${pos}Name`]?.trim() ?? "") == "(standard)")
					product[`${location}Screen${pos}Name`] = null
				})
			})

			product.added = false
			product.deleted = false

			retVal.products.push(product)
		})

		// now get our customer
		dao = new CustomerDao(db)
		const customer = dao.get(retVal.CustomerId)

		if (customer == null)
			throw Error("this order has an invalid customer id")

			retVal.customer = {
				CustomerId: customer.CustomerId,
				Code: customer.Code,
				Company: customer.Company,
				detailsString:  customerService.getDetailsString(customer)
		}

		return retVal

	}

	finally {
		db.close()
	}

}

module.exports = { get }