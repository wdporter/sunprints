const express = require("express")
const router = express.Router()

const salesRepService = require("../service/salesRepService.js")
const orderService = require("../service/orderService.js")
const productService = require("../service/productService.js")

const art = require("../config/art.js")
const { sizeCategories, sizes, auditColumns } = require("../sizes.js")


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
			purchaseOrders,
			poweruser: res.locals.poweruser
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
* client will most likely want to refetch the products
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
1. Check order for diffs
	if there are no diffs, go to 5
2. UPDATE Orders
3. AuditLog Orders UPDATE
4. UPDATE SalesTotal
5. put designs into first non-deleted product 
for each product
	5. if added and deleted are true, continue
	6. if the product is added:
		6a. INSERT OrderGarment
		6b. AuditLog OrderGarment INSERT 
		6c. INSERT Sales
		6d. UPDATE Garment (reduce stock level)
		6e. AuditLog UPDATE Garment 
	7. if the product is deleted
		7a. DELETE OrderGarment
		7b. AuditLog OrderGarment DELETE
		7c. DELETE Sales
		7d. UPDATE Garment (increase stock level)
		7e. AuditLog UPDATE Garment
	8. Check Diffs.
		if there are no diffs, continue loop	
	9. if the product is changed:
		9a. UPDATE OrderGarment
		9b. AuditLog OrderGarment UPDATE
		9c. UPDATE Sales
		9d. UPDATE OrderGarment (reduce stock levels)
		9e. AuditLog UPDATE OrderGarment
end each product

return last modified by, last modified date time
*/
router.put("/:id", (req, res) => {



})



module.exports = router