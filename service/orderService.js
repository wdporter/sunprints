const getDB = require("../integration/dbFactory")
const OrderDao = require("../integration/OrderDAO.js")
const ProductDao = require("../integration/ProductDAO.js")
const OrderModel = require("../models/order.js")
const CustomerDao = require("../integration/CustomerDAO.js")
const customerService = require("./customerService.js")
const purchaseOrderService = require("./purchaseOrderService.js")
const { art, locations, decorations } = require("../config/art.js")
const auditing = require("../config/auditColumns.js")



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

		// now populate our products
		dao = new ProductDao(db)
		const products = dao.getByOrderId(orderId)

		products.forEach(product => {
			product.added = false
			product.removed = false

			retVal.products.push(product)
		})

		// move our designs from products[0] into "designs" property
		for (location of locations) {
			for (design of art) {
				retVal.designs[`${location}${design.decoration}DesignId`] = retVal.products[0][`${location}${design.decoration}DesignId`]
				retVal.designs[`${location}${design.decoration}DesignName`] = retVal.products[0][`${location}${design.decoration}DesignName`]

				// the order page ignores these
				retVal.products.forEach(product => {
					delete product[`${location}${design.decoration}DesignId`]
					delete product[`${location}${design.decoration}DesignName`]
				})

				// media
				for (position of [1, 2]) {
					retVal.designs[`${location}${design.medium}${position}Id`] = retVal.products[0][`${location}${design.medium}${position}Id`]
					retVal.designs[`${location}${design.medium}${position}Name`] = retVal.products[0][`${location}${design.medium}${position}Name`]

					// the order page ignores these
					retVal.products.forEach(product => {
						delete product[`${location}${design.medium}${position}Id`]
						delete product[`${location}${design.medium}${position}Name`]
					})
				}
			}
		}

		// trim names and delete if (standard) -- this is an artefact of the db query
		for (design in retVal.designs) {
			if (typeof retVal.designs[design] == "string") {
				retVal.designs[design] = retVal.designs[design].trim()
				if (retVal.designs[design] == "(standard)")
					retVal.designs[design] = null
			}
		}


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

module.exports = { get, getNew }