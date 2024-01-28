// todo delete this whole file

const express = require("express")
const router = express.Router()

const salesRepServiceOld = require("../service/salesRepServiceDeprecated.js")
const orderService = require("../service/orderService.js")
const productService = require("../service/productService.js")
const purchaseOrderService = require("../service/purchaseOrderService.js")
const customerServiceOld = require("../service/customerServiceDeprecated.js")
const regionServiceOld = require("../service/regionServiceDeprecated.js")

const art = require("../config/art.js")
const sz = require("../config/sizes.js");

/* GET the main order editing page */
router.get("/edit", function (req, res) {

	try {
		const salesReps = salesRepServiceOld.getCurrentSalesRepNames()

		let purchaseOrders = null
		let order = null

		if (req.query.id) {
			// editing
			order = orderService.get(req.query.id)
		}
		else {
			// create
			order = orderService.getNew()

			// purchase orders needed in case of buyin
			purchaseOrders = purchaseOrderService.getOutstanding()
		}

		if (req.query.customerid) {
			order.CustomerId = req.query.customerid
			const myCustomer = customerServiceOld.get(req.query.customerid)
			order.customer = {
				Code: myCustomer.Code,
				Company: myCustomer.Company,
				detailsString: customerServiceOld.getDetailsString(myCustomer)
			}
		}

		if (req.query.salesrep) {
			order.SalesRep = req.query.salesrep
		}


		res.render("order_edit.ejs", {
			title: req.query.id ? "Edit Order" : "New Order",
			stylesheets: ["/stylesheets/order_edit-theme.css"],
			user: req.auth.user,
			locations: art.locations,
			decorations: art.decorations,
			sizes: sz.sizes,
			media: art.media,
			order,
			salesReps,
			purchaseOrders,
			poweruser: res.locals.poweruser,
			regions: regionServiceOld.all().map(r => {return { id: r.RegionId, name: r.Name }})
		})

	}
	catch (err) {
		console.log(err)
		res.statusMessage = err.message
		res.status(400)
	}
}
) //~ end get


router.get("/products/:orderid", (req, res) => {
	try {
		let { products } = productService.getProductsForOrder(req.params.orderid)
		res.json(products).end()
	}
	catch(err) {
		console.log(err)
		res.statusMessage = err
		res.status(400).end()
	}

})


/* POST new order 
* returns a json with new order id and audit columns
* client will refetch the products
*/
router.post("/", (req, res) => {
	try {

		const {order, designs} = req.body

		const { savedOrder, errors } = orderService.createNew(order, designs, req.auth.user)

		if (errors.length > 0) {
			res.json({errors}).end()
		}
		else {
			const retVal = { OrderId: savedOrder.OrderId}
			auditColumns.forEach(c => retVal[c] = savedOrder[c])
			res.json(retVal).end()
		}
	}


	catch(ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		console.log(ex.message)
	}

})


/* PUT update order 
returns the saved item from the Orders table
client should refetch the products (items from OrderGarment table)
*/
router.put("/:id", (req, res) => {

	try {

		const {order, designs} = req.body

		const { savedOrder, errors } = orderService.edit(order, designs, req.auth.user)

		if (errors.length > 0) {
			res.json({errors}).end()
		}
		else {
			res.json(savedOrder).end()
		}
	}


	catch(ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		console.log(ex.message)
	}


})



module.exports = router