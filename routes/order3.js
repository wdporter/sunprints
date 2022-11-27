const express = require("express")
const router = express.Router()

const salesRepService = require("../service/salesRepService.js")
const orderService = require("../service/orderService.js")
const productService = require("../service/productService.js")
const customerService = require("../service/customerService.js")

const art = require("../config/art.js")
const { sizeCategories, sizes, auditColumns } = require("../sizes.js")


/* GET the main order editing page */
router.get("/", (req, res) => {

	let order = { 
		OrderId: 0, 
		OrderDate: new Date().toISOString().substring(0, 10)
	}
	let customer = {}
	if (req.query.id) {
		order = orderService.get(req.query.id)
		customer = customerService.get(order.CustomerId)
		customer.detailsString = customerService.getDetailsString(customer)
	}
	const salesReps = salesRepService.getCurrentSalesRepNames()

	try {
	res.render("orderedit.ejs", {
		title: "New Order 3, building new page",
		stylesheets: ["/stylesheets/orderedit-theme.css"],
		user: req.auth.user,
		poweruser: res.locals.poweruser,

		order,
		customer,
		salesReps

	})
	}
	catch(ex) {
		console.log(ex)
		res.statusMessage = ex.message
		res.status(400)
	}

})




module.exports = router