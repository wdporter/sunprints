const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");
const sz = require("../config/sizes.js")
const productService = require("../service/productService.js")


// GET returns stock order details for given id,
// used by the purchasing page
router.get("/:id", function (req, res) {
	const db = getDB();
	try {

		let statement = db.prepare(`SELECT * FROM StockOrder WHERE StockOrderId=?`)
		const stockOrder = statement.get(req.params.id)


		// add the garments to the stock order object
		statement = db.prepare(`SELECT StockOrderGarment.*, Code, Type, Colour, Label, SizeCategory  
		FROM StockOrderGarment 
		INNER JOIN Garment ON Garment.GarmentId=StockOrderGarment.GarmentId
		WHERE StockOrderId=?`)
		const garments = statement.all(req.params.id)
		stockOrder.garments = garments

		res.json(stockOrder)

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		if (db != null)
			db.close()
	}
})


// Get a list of unprocessed stockorders in json
router.get("/", (req, res) => {

	const db = getDB();
	try {

		const statement = db.prepare(/*sql*/`
			SELECT StockOrderId, Supplier.Company AS Company, OrderDate, StockOrder.Notes 
			FROM StockOrder 
			INNER JOIN Supplier ON Supplier.SupplierId = StockOrder.SupplierId 
			WHERE StockOrder.Deleted = 0 AND StockOrder.ReceiveDate IS NULL`)

		stockOrders = statement.all()

		res.json(stockOrders)

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		if (db != null)
			db.close()
	}

})


// get a list of products, in the same format as for editing an order
router.get("/:id/products", (req, res) => {
	try {

		const products = productService.getStockOrderProducts(req.params.id)

		res.json(products)

	}
	catch(ex) {
		res.statusMessage = ex.message
		res.status(400)
	}


})


/*************************************************************************** */


// POST is insert new stock order
router.post("/", function (req, res) {

	const db = getDB();
	try {


		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()

		const columns = []
		for (col in req.body) {
			if (col == "chosenGarments")
				continue
			if (req.body[col].trim)
				req.body[col] = req.body[col].trim()
			if (req.body[col])
				columns.push(col)
		}

		let statement = db.prepare(`INSERT INTO StockOrder ( ${columns.join(", ")}
			) VALUES (
				${columns.map(c => ` @${c} `).join(", ")}
		);`)

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(req.body)
		req.body.stockOrderId = info.lastInsertRowid
		console.log(info)

		// audit log
		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("StockOrder", req.body.stockOrderId, "INS", req.body.CreatedBy, req.body.CreatedDateTime)
		console.log(info)
		let auditLogId = info.lastInsertRowid
		statement = db.prepare("INSERT INTO AuditLogEntry VALUES(null, ?, ?, null, ?)")
		for (col of columns) {
			if (!col.startsWith("created") && !col.startsWith("lastM")) {
				info = statement.run(auditLogId, col, req.body[col])
				console.log(info)
			}
		}


		sz.sizeCategories.forEach(function (category) {
			req.body.chosenGarments[category].forEach(function (garment) {
				let count = 0
				let insert = `INSERT INTO StockOrderGarment (
					StockOrderId, GarmentId `
				sz.allSizes.forEach(function (size) {
					if (garment[size]) {
						insert += ` , ${size}`
						count += garment[size]
					}
				})

				// if (count == 0) {
				// 	db.prepare("COMMIT")
				// 	res.send(String(req.body.stockOrderId))
				// 	return // we don't save it if the values add up to 0  
				// HA! yes we do…
				// }

				const mySizes = []
				insert += `, CreatedBy, CreatedDateTime, LastModifiedBy, LastModifiedDateTime ) VALUES ( 
					@stockOrderId, @GarmentId `
				sz.allSizes.forEach(function (size) {
					if (garment[size]) {
						insert += ` , @${size}`
						mySizes.push(size)
					}
				})
				insert += ` , @CreatedBy, @CreatedDateTime, @CreatedBy, @CreatedDateTime`
				insert += ` )`
				let statement = db.prepare(insert)
				garment.stockOrderId = req.body.stockOrderId
				garment.CreatedBy = req.body.CreatedBy
				garment.CreatedDateTime = req.body.CreatedDateTime
				info = statement.run(garment)
				console.log(info)

				// audit log
				statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
				info = statement.run("StockOrderGarment", info.lastInsertRowid, "INS", req.body.CreatedBy, req.body.CreatedDateTime)
				console.log(info)
				let auditLogId = info.lastInsertRowid
				statement = db.prepare("INSERT INTO AuditLogEntry VALUES(null, ?, ?, null, ?)")
				for (size of mySizes) {
					info = statement.run(auditLogId, size, garment[size])
					console.log(info)
				}

			})
		})


		db.prepare("COMMIT").run()

		res.send(String(req.body.stockOrderId))


	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}


})


// POST to receive a garment, garment details in body and stock order id in param
router.post("/receivegarment/:id", function (req, res) {
	const db = getDB();
	try {

		const now = new Date()
		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = now.toLocaleString()

		const myGarment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(req.body.GarmentId)

		// first update the stock level in the garment table
		const columns = []
		sz.allSizes.forEach(s => {
			if (req.body[s]) {
				columns.push(s)
			}
		})
		if (columns.length == 0) {
			res.sendStatus("We cannot receive this order because size Quantities are all zero")
			res.send(400)
			return
		}
		let query = "UPDATE Garment SET "
		query += columns.map(c => ` ${c}=${c} + @${c} `).join(", ")
		query += ", LastModifiedBy=@LastModifiedBy, LastModifiedDateTime=@LastModifiedDateTime" 
		query += ` WHERE GarmentId=@GarmentId`
		let statement = db.prepare(query)

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(req.body)
		console.log(info)

		//audit logs
		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("Garment", req.body.GarmentId, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
		console.log(info)
		let auditLogId = info.lastInsertRowid
		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
		for (const col of columns) {
			const oldValue = myGarment[col]
			const incoming = req.body[col]
			if (incoming != 0) {
				info = statement.run(auditLogId, col, oldValue, oldValue + incoming)
				console.log(info)
			}
		}


		// 2. remove the garment from StockOrderGarment 
		const myStockOrderGarment = db.prepare("SELECT * FROM StockOrderGarment WHERE StockOrderId=? AND GarmentId=?").get(req.params.id, req.body.GarmentId)
		statement = db.prepare("DELETE FROM StockOrderGarment WHERE StockOrderGarmentId=?")
		info = statement.run(myStockOrderGarment.StockOrderGarmentId)
		console.log(info)
		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("StockOrderGarment", req.params.id, "DEL", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
		auditLogId = info.lastInsertRowid
		console.log(info)
		columns.push("StockOrderId", "GarmentId")
		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, null)")
		for (const col of columns) {
				info = statement.run(auditLogId, col, myStockOrderGarment[col])
				console.log(info)
		}


		// 3. if there are no more garments on the stock order, mark the order as received
		statement = db.prepare(`SELECT COUNT(*) AS Count FROM StockOrderGarment WHERE StockOrderId=?`)
		const count = statement.get(req.params.id).Count
		if (count == 0) {
			statement = db.prepare(`UPDATE StockOrder SET 
				ReceiveDate=?, 
				LastModifiedBy=?, 
				LastModifiedDateTime=? 
				WHERE StockOrderId=?`)
			const receiveDate = now.toISOString().slice(0, 10)
			info = statement.run(receiveDate, req.auth.user, req.body.LastModifiedDateTime, req.params.id)

			statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
			info = statement.run("StockOrder", req.params.id, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
			auditLogId = info.lastInsertRowid
			console.log(info)
			statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
			info = statement.run(auditLogId, "ReceiveDate", null, receiveDate)
			console.log(info)
		}

		db.prepare("COMMIT").run()

		res.send("ok").end()
	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()

	}
	finally {
		db.close()
	}

})



/*************************************************************************** */


// PUT to save changes
router.put("/:id", function (req, res) {

	const db = getDB();
	try {

		db.prepare("BEGIN TRANSACTION").run()

		req.body.createdBy = req.body.lastModifiedBy = req.auth.user
		req.body.createdDateTime = req.body.lastModifiedDateTime = new Date().toLocaleString()
		req.body.stockOrderId = req.params.id

		let statement = db.prepare("SELECT * FROM StockOrder WHERE StockOrderId=?")
		const original = statement.get(req.params.id)
		const changes = []
		if (original.Notes != req.body.notes)
			changes.push("Notes") //  = @notes
		if (original.SupplierId != req.body.supplierId)
			changes.push("SupplierId") //  = @supplierId
		if (original.OrderDate != req.body.orderDate)
			changes.push("OrderDate") //  = @orderDate

		if (changes.length > 0) {

			statement = db.prepare(`UPDATE StockOrder SET 
				${changes.map(c => ` ${c}=@${c[0].toLowerCase()}${c.substring(1)} `).join(", ")}, 
				LastModifiedBy = @lastModifiedBy, 
				LastModifiedDateTime = @lastModifiedDateTime
				WHERE StockOrderId = @stockOrderId
			;`)

			let info = statement.run(req.body)
			console.log(info)

			statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
			info = statement.run("StockOrder", req.body.stockOrderId, "UPD", req.body.lastModifiedBy, req.body.lastModifiedDateTime)
			const auditLogId = info.lastInsertRowid
			statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
			for (const change of changes) {
				info = statement.run(auditLogId, change, original[change], req.body[`${change[0].toLowerCase()}${change.substring(1)}`])
			}

		}

		// remove all items in StockOrderGarment, so we can add them back in,
		// which is much easier than trying to figure out what has changed
		// todo, this is lazy, do it properly, for the sake of audit logging
		statement = db.prepare(`DELETE FROM StockOrderGarment WHERE StockOrderId=?`)
		statement.run(req.params.id)


		sz.sizeCategories.forEach(function (category) {
			req.body.chosenGarments[category].forEach(function (garment) {
				let count = 0
				let insert = `INSERT INTO StockOrderGarment (
					StockOrderId, GarmentId `
				sz.allSizes.forEach(function (size) {
					if (garment[size]) {
						insert += ` , ${size}`
						count += garment[size]
					}
				})

				// if (count == 0)
				// 	return // we don't save it if the values add up to 0
				// commented out because it turns out, yes we do!


				insert += `, CreatedBy, CreatedDateTime, LastModifiedBy, LastModifiedDateTime ) VALUES ( 
					@stockOrderId, @GarmentId `
				sz.allSizes.forEach(function (size) {
					if (garment[size])
						insert += ` , @${size}`
				})
				insert += ` , @createdBy, @createdDateTime, @createdBy, @createdDateTime`
				insert += ` )`
				let statement = db.prepare(insert)
				garment.stockOrderId = req.body.stockOrderId
				garment.createdBy = req.body.createdBy
				garment.createdDateTime = req.body.createdDateTime
				const info = statement.run(garment)
				console.log(info)
			})
		})


		db.prepare("COMMIT").run()

		res.send(`${req.body.stockOrderId}`)


	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}


})


router.put("/removegarment/:stockorderid/:garmentid", (req, res) => {
	const db = getDB();
	try {
		db.prepare("BEGIN TRANSACTION").run()
		const myStockOrderGarment = db.prepare("SELECT * FROM StockOrderGarment WHERE StockOrderId=? AND GarmentId=?").get(req.params.stockorderid, req.params.garmentid)

		let info = db.prepare("DELETE FROM StockOrderGarment WHERE StockOrderGarmentId=?").run(myStockOrderGarment.StockOrderGarmentId)
		console.log(info)

		let statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("StockOrderGarment", myStockOrderGarment.StockOrderGarmentId, "DEL", req.auth.user, Date.now().toLocaleString())
		console.log(info)
		const auditLogId = info.lastInsertRowid

		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
		info = statement.run(auditLogId, "StockOrderId", req.params.stockorderid, null)
		console.log(info)
		info = statement.run(auditLogId, "GarmentId", req.params.garmentid, null)
		console.log(info)
		for (size of sz.allSizes) {
			if (myStockOrderGarment[size] != 0) {
				info = statement.run(auditLogId, size, myStockOrderGarment[size], null)
				console.log(info)
			}
		}


		db.prepare("COMMIT").run()

		res.send("ok").end()
	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
		console.log(`error: put("/removegarment/:stockorderid/:garmentid") ${ex.message}`)
	}
	finally {
			db.close()
	}

})


// PUT to receive a whole order
router.put("/receiveorder/:stockorderid", function (req, res) {
	const db = getDB();
	try {

		req.body.LastModifiedBy = req.auth.user
		const now = new Date()
		req.body.LastModifiedDateTime = now.toLocaleString()

		const myStockOrderGarments = db.prepare("SELECT * FROM StockOrderGarment WHERE StockOrderId=?").all(req.params.stockorderid)

		db.prepare("BEGIN TRANSACTION").run()

		for (stockOrderGarment of myStockOrderGarments) {
			// 1. update the garment table with the quantities in stockordergarment
			const columns = ["LastModifiedBy", "LastModifiedDateTime"]
			for (size of sz.allSizes) {
				if (stockOrderGarment[size]) {
					columns.push(size)
				}
			}
			let query = "UPDATE Garment SET "
			query += columns.map(c => {
				if (c.startsWith("LastM"))
					return ` ${c}=@${c} `
				else
					return ` ${c}=${c} + @${c} `
			}).join(", ")
			query += ` WHERE GarmentId=@GarmentId`

			stockOrderGarment.LastModifiedBy = req.auth.user
			stockOrderGarment.LastModifiedDateTime = req.body.LastModifiedDateTime

			info = db.prepare(query).run(stockOrderGarment)
			console.log(info)

			statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
			info = statement.run("Garment", stockOrderGarment.GarmentId, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
			auditLogId = info.lastInsertRowid
			console.log(info)
			const myGarment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(stockOrderGarment.GarmentId)
			statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
			for (col of columns) {
				if (col.startsWith("LastM"))
					continue
				info = statement.run(auditLogId, col, myGarment[col], myGarment[col] + stockOrderGarment[col])
				console.log(info)
			}

			// 2. delete the StockOrderGarment  
			info = db.prepare(` DELETE FROM StockOrderGarment WHERE StockOrderGarmentId=? `).run(stockOrderGarment.StockOrderGarmentId)
			statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
			info = statement.run("StockOrderGarment", stockOrderGarment.StockOrderGarmentId, "DEL", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
			auditLogId = info.lastInsertRowid
			console.log(info)
			statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
			for (col of columns) {
				if (col.startsWith("LastM"))
					continue
				info = statement.run(auditLogId, col, stockOrderGarment[col], null)
				console.log(info)
			}

		} // ~ end myStockOrderGarments

		// 3.  receive the order
		statement = db.prepare(`UPDATE StockOrder SET ReceiveDate=?, LastModifiedBy=?, LastModifiedDateTime=? WHERE StockOrderId=?`)
		const receiveDate = now.toISOString().slice(0, 10)
		info = statement.run(receiveDate, req.auth.user, req.body.LastModifiedDateTime, req.params.stockorderid)
		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("StockOrder", req.params.stockorderid, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
		auditLogId = info.lastInsertRowid
		console.log(info)
		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
		info = statement.run(auditLogId, "ReceiveDate", null, receiveDate) // assuming it should be null otherwise you wouldn't be calling this

		db.prepare("COMMIT").run()

		res.send("ok").end()
	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
			db.close()
	}

})



// DELETE delete a purchase order
router.delete("/:id", (req, res) => {
	const date = new Date().toLocaleString()
	const db = getDB();
	try {	
		
		let statement = db.prepare(`SELECT StockOrderGarmentId, StockOrderId, GarmentId, 
		${sz.allSizes.join(",")}
		FROM StockOrderGarment WHERE StockOrderId=?`)
		const deletedProducts = statement.all(req.params.id)

		db.prepare("BEGIN TRANSACTION").run()

		if (deletedProducts.length > 0) {

			statement = db.prepare ("DELETE FROM StockOrderGarment WHERE StockOrderId=?")
			let info = statement.run(req.params.id)

			deletedProducts.forEach(function(p) {
				statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?) ")
				info = statement.run("StockOrderGarment", p.StockOrderGarmentId, "DEL", req.auth.user, date)
				const auditLogId = info.lastInsertRowid
				delete p.StockOrderGarmentId
				for(column in p) {
					if (!p[column])
						continue
					statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, null)")
					statement.run(auditLogId, column, p[column])
				}
			})
		}

		statement = db.prepare("UPDATE StockOrder SET Deleted=1 WHERE StockOrderId=?")
		statement.run(req.params.id)

		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?) ")
		info = statement.run("StockOrder", req.params.id, "DEL", req.auth.user, date)
		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
		statement.run(info.lastInsertRowid, "Deleted", 0, 1 )

		db.prepare("COMMIT").run()

		res.send("ok").end()


	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
		console.log(`error: put("/removegarment/:stockorderid/:garmentid") ${ex.message}`)
	}
	finally {
			db.close()
	}
})


module.exports = router