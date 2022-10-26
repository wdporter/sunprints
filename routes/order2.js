const express = require("express")
const router = express.Router()
const art = require("../config/art.js");
const orderModel = require("../models/order.js")
const salesRepService = require("../service/salesRepService.js");
const { sizeCategories, sizes } = require("../sizes.js");


/* GET the main order editing page */
router.get("/edit", function (req, res) {

	try {
		const salesReps = salesRepService.getCurrentSalesRepNames()

		let purchaseOrders = null

		let order = null

		if (req.query.id) {
			const orderService = require("../service/orderService.js")
			order = orderService.get(req.query.id)
		}
		else {
			order = new OrderModel()

			// we only show purchase orders when it's a new order
			purchaseOrders = db.prepare("SELECT StockOrderId, OrderDate, Company FROM StockOrder INNER JOIN Supplier ON StockOrder.SupplierId = Supplier.SupplierId WHERE ReceiveDate IS NULL ").all()
			// fix the date
			purchaseOrders.forEach(po => po.OrderDate = new Date(Date.parse(po.OrderDate)).toLocaleDateString(undefined, { dateStyle: "short" }))
		}


		res.render("order_edit.ejs", {
			title: "New Order testing new page",
			stylesheets: ["/stylesheets/order_edit-theme.css"],
			user: req.auth.user,
			locations: art.locations,
			decorations: art.decorations,
			sizes,
			media: art.media,
			order,
			salesReps,
			purchaseOrders
		})

	}
	catch (err) {
		console.log(err)
		res.statusMessage = err.message
		res.status(400)
	}
}
) //~ end get


module.exports = router