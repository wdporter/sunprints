const express = require("express")
const router = express.Router()
const art = require("../config/art.js")
const salesRepService = require("../service/salesRepService.js")
const { sizeCategories, sizes } = require("../sizes.js")
const orderService = require("../service/orderService.js")


/* GET the main order editing page */
router.get("/edit", function (req, res) {

	try {
		const salesReps = salesRepService.getCurrentSalesRepNames()

		let purchaseOrders = null

		let order = null

		if (req.query.id) {
			order = orderService.get(req.query.id)
		}
		else {
			const newOrder = orderService.getNew()
			
			order = newOrder.order
			purchaseOrders = newOrder.purchaseOrders
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