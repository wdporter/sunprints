const getDB = require("../integration/dbFactory")
const OrderDao = require("../integration/OrderDAO.js")
const CustomerDao = require("../integration/CustomerDAO.js")

const OrderModel = require("../models/order.js")

const productService = require("../service/productService.js")
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

module.exports = { get, getNew }