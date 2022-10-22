const OrderDAO = require("../integration/OrderDAO.js")
const ProductDAO = require("../integration/ProductDAO.js")
const CustomerDAO = require("../integration/CustomerDAO.js")
const OrderModel = require("../models/order.js")
const art = require("../config/art.js")
const auditing = require("../config/auditColumns.js")


function get (orderId) {

	const orderObj = OrderDAO.get(orderId)
	if (!orderObj)
		throw Error (`We can't find an order with id: ${orderId}`)

	// convert date strings an boolean numbers to types
	orderObj.OrderDate = new Date(Date.parse(orderObj.OrderDate))
	orderObj.InvoiceDate = orderObj.InvoiceDate == null ? null : new Date(Date.parse(orderObj.InvoiceDate))
	orderObj.Repeat = !!orderObj.Repeat
	orderObj.New = !!orderObj.New
	orderObj.BuyIn = !!orderObj.BuyIn
	orderObj.ProcessedDate = orderObj.ProcessedDate == null ? null : new Date(Date.parse(orderObj.ProcessedDate))
	orderObj.Done = !!orderObj.Done
	orderObj.Deleted = !!orderObj.Deleted
	auditing.dateColumns.forEach(d => orderObj[d] = new Date(auditing.parseDate(orderObj[d])))

	const retVal = new OrderModel(orderObj)

	const products = ProductDAO.getByOrderId(orderId)

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

		retVal.products.push(product)
	})

	const customer = CustomerDAO.get(retVal.customerId)

	if (customer == null)
		throw Error("this order has an invalid customer id")

		retVal.customer = {
		customerId: customer.CustomerId,
		code: customer.Code,
		company: customer.Company,
		notes: customer.CustNotes,
		deliveryNotes: customer.DeliveryNotes
	}

	return retVal


}

module.exports = { get }