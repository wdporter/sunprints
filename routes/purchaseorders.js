const express = require("express")
const router = express.Router()
const getDb = require("../integration/dbFactory")


/* GET orders page. */
router.get("/", function (req, res, next) {
	res.render("purchaseorders.ejs", {
		title: "Purchase Orders",
		stylesheets: [],
		javascripts: [],
		user: req.auth.user,
		poweruser: res.locals.poweruser,
	})
})


router.get("/dt", (req, res) => {
	let db = null
	try {
		const db = getDb()

		const recordsTotal = db.prepare(/*sql*/`SELECT COUNT(*) as Count 
	FROM StockOrder 
	WHERE Deleted=0 
	${req.query.includeReceived == 'false' ? ' AND ReceiveDate ISNULL ' : ''}`).get().Count
		let recordsFiltered = recordsTotal

		let query = /*sql*/`SELECT StockOrderId, Supplier.Company AS Supplier, Supplier.SupplierId, OrderDate, ReceiveDate, StockOrder.Notes AS Notes
	FROM StockOrder 
	INNER JOIN Supplier USING (SupplierId) 
	WHERE StockOrder.Deleted=0 `
	if (req.query.includeReceived == 'false')
		query += " AND  ReceiveDate ISNULL "

		if (req.query.search.value) {
			const searchTerm = req.query.search.value.trim()

			let whereClause = /*sql*/` AND (
			Supplier.Company LIKE '%${searchTerm}%' 
			OR StockOrder.Notes LIKE '%${searchTerm}%' 
			OR CAST(StockOrderId AS TEXT) LIKE  '%${searchTerm}%' 
			) `

			var recordsFilteredQuery = /*sql*/`SELECT COUNT(*) AS Count 
			FROM StockOrder 
			INNER JOIN Supplier USING (SupplierID)
			WHERE StockOrder.Deleted=0 ${whereClause}`
		
			recordsFiltered = db.prepare(recordsFilteredQuery).get().Count

			query += whereClause
		}

		const columns = ["StockOrderId", "Supplier", "OrderDate", "ReceiveDate", "Notes"]
		const orderByClause = req.query.order.map(o => {
			return ` ${columns[Number(o.column)]} ${o.dir} `
		})
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`

		const purchaseOrders = db.prepare(query).all()

		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data: purchaseOrders
		})
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(`error: get("/dt") ${ex.message}`)
	}

	finally {
		db && db.close()
	}



})



module.exports = router