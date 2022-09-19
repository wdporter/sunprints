const express = require("express")
const router = express.Router()
const Database = require("better-sqlite3");

/* GET customers page. */
router.get("/", function (req, res, next) {
	res.render("customer.ejs", {
		title: "Customers",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	})
})



/* GET deleted customers page. */
router.get("/deleted", function (req, res) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	const deleted = db.prepare("SELECT * FROM Customer WHERE DELETED=1 ORDER BY LastModifiedDateTime DESC").all()

	res.render("deleted/customers.ejs", {
		title: "Deleted Customers",
		user: req.auth.user,
		deleted,
		poweruser: res.locals.poweruser
	})
})




// GET a listing in DataTables format
router.get("/dt", function (req, res, next) {
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {


		const recordsTotal = db.prepare("SELECT COUNT(*) AS Count FROM Customer WHERE Deleted=0 ").get().Count
		let recordsFiltered = recordsTotal

		let query = `SELECT Customer.*, s.maxdate FROM Customer 
		LEFT OUTER JOIN 
		(SELECT CustomerId, MAX(OrderDate) AS maxdate
		FROM SalesTotal 
		GROUP BY CustomerId
		) s
		ON  s.CustomerId=Customer.CustomerId 
		WHERE Deleted=0 `

		if (req.query.search.value)
			req.query.search.value = req.query.search.value.trim()
		if (req.query.search.value) {
			const whereClause = ` AND Code LIKE '%${req.query.search.value}%' OR Company LIKE '%${req.query.search.value}%' `
			recordsFiltered = db.prepare(`SELECT COUNT(*) AS Count FROM Customer WHERE Deleted=0 ${whereClause}`).get().Count
			query += whereClause
		}




		const columns = ["CustomerId", "Code", "Company", "Surname", "FirstName", "PhoneOffice", "PhoneHome", "PhoneMobile", "Fax", "Email", "AddressLine1", "AddressLine2", "Locality", "Postcode", "State", "Notes", "CreatedBy", "CreatedDateTime", "LastModifiedBy", "LastModifiedDateTime", "CustNotes", "maxdate"]
		const orderByClause = req.query.order.map(o => ` ${columns[o.column]} COLLATE NOCASE ${o.dir} `)
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`
		const customers = db.prepare(query).all()


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data: customers.map(cust => {
				const retVal = {
					DT_RowAttr: { "data-id": cust.CustomerId },
					DT_RowId: `row-${cust.CustomerId}`
				}
				columns.forEach(col => {
					retVal[col] = cust[col]
				})
				// retVal.maxdate = cust.maxdate
				return retVal
			})
		})
	}
	catch (ex) {
		console.log(ex)
		res.statusMessage = ex.message
		res.sendStatus(400).end()
	}
	finally {
		db.close()
	}


})


// get a list of customers, used by the New Order page
router.get("/ordersearch", function (req, res, next) {
	let db = null
	try {
		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
		let statement = db.prepare(`SELECT CustomerId, Code, Company, Locality, State 
			FROM Customer 
			WHERE Deleted=0 AND 
			(
				Code LIKE '%${req.query.q}%' 
				OR Company LIKE '%${req.query.q}%'
			) `)
		const records = statement.all()
		res.send(records)
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db && db.close()
	}
})


// create or new or POST  customer
router.post("/", (req, res) => {

	let db = null
	try {
		if (!req.body.Code) {
			res.statusMessage = "We require a customer code. "
			res.status(400).end()
			return
		}
		if (!req.body.Company) {
			res.statusMessage = "We require a company name. "
			res.status(400).end()
			return
		}

		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

		let statement = db.prepare(`SELECT COUNT(*) AS count FROM Customer WHERE Code='${req.body.Code}'`)
		if (statement.get().count > 0) {
			res.statusMessage = "We require a unique customer code. Check if the customer already exists."
			res.status(400).end()
			return
		}


		statement = db.prepare(`SELECT COUNT(*) AS count FROM Customer WHERE Company='${req.body.Company}'`)
		if (statement.get().count > 0) {
			res.statusMessage = "We require a unique company name. Check if the customer already exists."
			res.status(400).end()
			return
		}

		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()

		db.prepare("BEGIN TRANSACTION").run()

		let query = "INSERT INTO Customer ("
		const columns = []
		for (let key in req.body)
			if (req.body[key])
				columns.push(key)
		query += columns.join(", ")
		query += " ) VALUES ( "
		const values = columns.map(c => `@${c}`)
		query += values.join(", ")
		query += " )"
		statement = db.prepare(query)

		let info = statement.run(req.body)

		res.json({
			message: "success",
			id: info.lastInsertRowid
		}).end()


		// now add it to audit logs
		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Customer", info.lastInsertRowid, "INS", req.auth.user, req.body.CreatedDateTime)


		// now add it to audit log entry
		for (let col of columns) {
			if (col.startsWith("Created") || col.startsWith("LastM"))
				continue
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, NewValue) VALUES(?, ?, ?)")
			statement.run(info.lastInsertRowid, col, req.body[col])
		}

		db.prepare("COMMIT").run()

	}
	catch (ex) {
		console.log(ex)
		res.statusMessage = ex.message
		res.status(400).end()
		db.prepare("ROLLBACK").run()
	}
	finally {
		if (db != null)
			db.close()
	}
})


// update or edit PUT  existing customer
router.put("/:id", (req, res) => {
	const errors = []
	let db = null
	try {
		if (!req.body.Code)
			errors.push("We require a customer code")
		if (!req.body.Company)
			errors.push("We require a company name")

		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

		let statement = db.prepare(`SELECT COUNT(*) AS count FROM Customer WHERE Code='${req.body.Code}' AND CustomerId != ${req.body.CustomerId}`)
		if (statement.get().count > 0)
			errors.push("We require a unique customer code. This code is already in use.")

		statement = db.prepare(`SELECT COUNT(*) AS count FROM Customer WHERE Company='${req.body.Company}' AND CustomerId != ${req.body.CustomerId}`)
		if (statement.get().count > 0)
			errors.push("We require a unique company name. This customer name is already in use")

		statement = db.prepare("SELECT * FROM Customer WHERE CustomerId=?")
		const myCustomer = statement.get(req.params.id)

		const changedColumns = []
		for (let key in req.body) {
			if (myCustomer[key] != req.body[key])
				changedColumns.push(key)
		}
		if (changedColumns.length == 0) {
			errors.push("We couldn’t save, submitted values are all the same.")
		}

		if (errors.length > 0) {
			res.statusMessage = errors.join("; ")
			res.status(400).end()
			return
		}

		// now begin the actual save
		db.prepare("BEGIN TRANSACTION").run()

		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = new Date().toLocaleString()

		let query = "UPDATE Customer SET "
		for (let col of changedColumns) {
			query += `${col}=@${col}, `
		}

		query += " LastModifiedBy=@LastModifiedBy, LastModifiedDateTime=@LastModifiedDateTime WHERE CustomerId=@CustomerId"

		statement = db.prepare(query)

		let info = statement.run(req.body)

		res.json({
			"message": "success",
			"id": req.body.CustomerId
		}).end()

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Customer", req.params.id, "UPD", req.auth.user, req.body.LastModifiedDateTime)


		// now add it to audit log entry
		for (let col of changedColumns) {
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
			statement.run(info.lastInsertRowid, col, myCustomer[col], req.body[col])
		}

		db.prepare("COMMIT").run()

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		console.log(ex)
		errors.push(ex.message)
		res.statusMessage = errors.join("; ")
		res.status(400).end()
	}
	finally {
		if (db != null)
			db.close()
	}

})



router.put("/restore/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		const date = new Date().toLocaleString()

		db.prepare("BEGIN TRANSACTION").run()
		let statement = db.prepare("UPDATE Customer SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE CustomerId=?")
		statement.run(req.auth.user, date, req.params.id)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Customer", req.params.id, "UPD", req.auth.user, date)

		statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES (?, ?, ?, ?)")
		info = statement.run(info.lastInsertRowid, "Deleted", 1, 0)

		db.prepare("COMMIT").run()

		res.send("ok")

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		console.log(ex)
		res.statusMessage = err.message
		res.status(400).end()
	}

	finally {
		db.close()
	}

})




router.delete("/:id", (req, res) => {


	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		// now begin the actual save
		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare("UPDATE Customer SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE CustomerId=?")

		const deleteDate = new Date().toLocaleString()
		let info = statement.run(req.auth.user, deleteDate, req.params.id)


		// now add it to audit logs, don't need auditlogentry because a DEL is just changing DELETED from 0 to 1
		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Customer", req.params.id, "DEL", req.auth.user, deleteDate)

		db.prepare("COMMIT").run()
		res.send("ok").end()


	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		console.log(ex.message)
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}


})



module.exports = router
