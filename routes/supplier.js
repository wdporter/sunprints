const express = require("express")
const router = express.Router()

const Database = require("better-sqlite3");


/* GET Suppliers page. */
router.get("/", function (req, res, next) {
	res.render("supplier.ejs", { 
		title: "Suppliers",
		user: req.auth.user
	 })
})


// GET datatables format
router.get("/dt", function(req, res) {

	let db = null

	try {
		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
		
		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) AS Count FROM Supplier WHERE Deleted=0 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let query = `SELECT Supplier.*, s.maxdate  FROM Supplier 
		LEFT OUTER JOIN 
		(SELECT SupplierId, MAX(OrderDate) AS maxdate
		FROM StockOrder 
		GROUP BY SupplierId
		) s
		ON  s.SupplierId=Supplier.SupplierId `
		let	whereClause = " WHERE Deleted = 0 "
		if (req.query.search.value)
			req.query.search.value = req.query.search.value.trim()
		if (req.query.search.value) {
			whereClause += ` AND (Code LIKE '%${req.query.search.value}%' 
			OR Company LIKE '%${req.query.search.value}%' 
			OR Notes LIKE '%${req.query.search.value}%') `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM Supplier ${whereClause}`)
			recordsFiltered = statement.get().count
		}

		query += whereClause

		const columns = ["SupplierId", "Code", "Company", "Surname", "FirstName", 
				"PhoneOffice", "PhoneHome", "PhoneMobile", "Fax", "Email", 
				"AddressLine1", "AddressLine2", "Locality", "Postcode", "State", "Notes",
				 "maxdate"]
		query += ` ORDER BY ${columns[req.query.order[0].column]} COLLATE NOCASE ${req.query.order[0].dir} `

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`
		const data = db.prepare(query).all()


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data
		})

	}
	catch(ex) {
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		if (db != null)
			db.close()
	}

})


/* GET deleted Suppliers page. */
router.get("/deleted", function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	const deleted = db.prepare("SELECT * FROM Supplier WHERE DELETED=1 ORDER BY LastModifiedDateTime DESC").all()

	res.render("deleted/suppliers.ejs", {
		title: "Deleted Suppliers",
		user: req.auth.user,
		deleted
	})
})


/*************************************************************************** */

/// POST to create a new supplier
router.post("/", function(req, res) {
	
	if (!req.body.Code) {
		res.statusMessage = "We require a supplier code. "
		res.status(400).end()
		return
	}
	if (!req.body.Company) {
		res.statusMessage = "We require a supplier name. "
		res.status(400).end()
		return
	}

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		let statement = db.prepare(`SELECT COUNT(*) AS count FROM Supplier WHERE Code='${req.body.Code}'`)
		if (statement.get().count > 0) {
			res.statusMessage = "We require a unique supplier code. Check if the supplier already exists."
			res.status(400).end()
			return
		}

		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()
		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user

		db.prepare("BEGIN TRANSACTION").run()

		const columns = []
		for (const key in req.body)
			if (req.body[key])
				columns.push(key)
		
		let query = `INSERT INTO Supplier ( 
			${columns.join(", ")} 
			 ) VALUES ( 
				${columns.map(col => `@${col}`).join(", ")}
		)`
		statement = db.prepare(query)
		let info = statement.run(req.body)

		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("Supplier", info.lastInsertRowid, "INS", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
		auditLogId = info.lastInsertRowid
		console.log(info)
		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
		for (col of columns) {
			info = statement.run(auditLogId, col, null, req.body[col]) // assuming it should be null otherwise you wouldn't be calling this
			console.log(info)
		}

		db.prepare("COMMIT").run()

		res.json({
			message: "success",
			id: info.lastInsertRowid
		}).end()



	}
	catch(ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		if (db != null)
			db.close()
	}
})


// PUT to edit an existing supplier
router.put("/:id", function(req, res) {

	if (req.params.id != req.body.SupplierId) {
		res.statusMessage = "The url’s id doesn’t match body’s SupplierId. "
		res.status(400).end()
		return

	}
	
	if (!req.body.Code) {
		res.statusMessage = "We require a supplier code. "
		res.status(400).end()
		return
	}
	if (!req.body.Company) {
		res.statusMessage = "We require a supplier name. "
		res.status(400).end()
		return
	}

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		// check the code isn't being set to a value we already have
		let statement = db.prepare(`SELECT COUNT(*) AS count FROM Supplier WHERE Code='${req.body.Code}'`)
		if (statement.get().count > 1) {
			res.statusMessage = "We require a unique supplier code. That code is already in use."
			res.status(400).end()
			return
		}

		// set auditing values
		req.body.LastModifiedDateTime = new Date().toLocaleString()
		req.body.LastModifiedBy = req.auth.user
		
		// get the existing item from database
		statement = db.prepare("SELECT * FROM Supplier WHERE SupplierId=?")
		const mySupplier = statement.get(req.params.id)

		let query = "UPDATE Supplier SET "

		// look for updated values
		const columns = []
		for (var key in req.body) {
			if (mySupplier[key] != req.body[key]) {
				columns.push(key)
			}
		}
		query += columns.map(c => `${c}=@${c}`).join(", ")
		query += " WHERE SupplierId = @SupplierId "

		statement = db.prepare(query)
		db.prepare("BEGIN TRANSACTION").run()
		statement.run(req.body)
		

			// insert into AuditLog
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			const info = statement.run("Supplier", req.params.id, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)

			// insert into AuditLogEntry
			for (var col of columns) {
				if (col.startsWith("LastM")) {
					continue
				}
				statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
				statement.run(info.lastInsertRowid, col, mySupplier[col], req.body[col])
			}

			db.prepare("COMMIT").run()

			res.json({
				message: "success"
			}).end()
	
	}
	catch(ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		db.close()
	}

})


// PUT to undelete a supplier
router.put("/restore/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		db.prepare("BEGIN TRANSACTION").run()

		const date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE Supplier SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE SupplierId=?")
		statement.run(req.auth.user, date, req.params.id)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Supplier", req.params.id, "UPD", req.auth.user, date)

		statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES (?, ?, ?, ?)")
		info = statement.run(info.lastInsertRowid, "Deleted", 1, 0)

		db.prepare("COMMIT").run()

		res.send("ok")

	}
	catch(err) {
		console.log(err)
		db.prepare("ROLLBACK").run()
		res.statusMessage = err.message
		res.status(400).end()
	}

	finally {
		db.close()
	}

})




// PUT to edit an existing supplier
router.delete("/:id", function(req, res) {
	const errors = []
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		
		const deleteDate = new Date().toLocaleString()

		let statement = db.prepare(`UPDATE  Supplier 
		SET Deleted = 1 ,
		LastModifiedBy = ?,
		LastModifiedDateTime = ?
		WHERE SupplierId = ?`)
		statement.run(req.auth.user, deleteDate, req.params.id)

		res.json({
			message: "success"
		}).end()

		
		// now add it to audit logs, don't need auditlogentry because a DEL is just changing DELETED from 0 to 1
		try {
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Supplier", req.params.id, "DEL", req.auth.user, deleteDate)
		}
		catch(ex) {
			// do nothing, because the response has already ended. 
			// if we threw the error, then it would be caught and the .end() would have been called twice
			console.log(ex.message)
		}

	}
	catch(ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}

})


module.exports = router