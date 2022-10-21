const express = require("express")
const router = express.Router()
const Database = require("better-sqlite3");
const sz = require("../sizes.js");


/* GET the main order editing page */
router.get("/edit", function(req, res) {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	try {
		const salesReps = db.prepare("SELECT Name FROM SalesRep WHERE DELETED=0").all().map(sr => sr.Name)

		let purchaseOrders = {}
		let order = { 
			OrderId: 0, 
			SalesRep: "",
			Terms: "",
			products: []
		}
		let customer = {}

		if (req.query.id) {
			order = db.prepare("SELECT * FROM Orders WHERE OrderId=?").get(req.query.id)
			const orderGarmentQuery = getOrderGarmentQuery()
			order.products = db.prepare(orderGarmentQuery).all(req.query.id)

			order.products.forEach(product => {
				sz.locations.forEach(location => {
					if ((product[`${location}Screen1Name`]?.trim() ?? "") == "(standard)")
						product[`${location}Screen1Name`] = null
					if ((product[`${location}Screen2Name`]?.trim() ?? "") == "(standard)")
						product[`${location}Screen2Name`] = null
				})
			})

			customer = db.prepare("SELECT * FROM Customer WHERE CustomerId=?").get(order.CustomerId)
		}
		else {
			// we only show purchase orders when it's a new order
			purchaseOrders = db.prepare("SELECT StockOrderId, OrderDate, Company FROM StockOrder INNER JOIN Supplier ON StockOrder.SupplierId = Supplier.SupplierId WHERE ReceiveDate IS NULL ").all()
			// fix the date
			purchaseOrders.forEach(po => po.OrderDate = new Date(Date.parse(po.OrderDate)).toLocaleDateString(undefined, {dateStyle: "short"}))
		}


		res.render("order_edit.ejs", {
			title: "New Order testing new page",
			user: req.auth.user,
			locations: sz.locations,
			decorations: sz.decorations,
			media: sz.media,
			order,
			customer,
			salesReps,
			purchaseOrders
		})
	}
	finally {
		db.close()
	}

})


