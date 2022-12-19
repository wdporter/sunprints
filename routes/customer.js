const express = require("express")
const router = express.Router()
const Database = require("better-sqlite3");
const { auditColumns } = require("../sizes.js");
const customerService = require("../service/customerService")


/* GET customers page. */
router.get("/", function (req, res, next) {
	res.render("customer.ejs", {
		title: "Customers",
		stylesheets: ["/stylesheets/customer-theme.css"],
		user: req.auth.user,
		poweruser: res.locals.poweruser,
		salesrep: res.locals.salesrep
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
		poweruser: res.locals.poweruser,
		salesrep: res.locals.salesrep
	})
})


// GET a listing in DataTables format used by datatables ajax
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

		let whereParams = []
		let whereClause = ""
		if (req.query.search.value) {
			const searchables = req.query.columns.filter(c => c.searchable == "true")
			const cols = searchables.map(c => `${c.data} LIKE ?`).join(" OR ")
			whereParams = searchables.map(c => `%${req.query.search.value}%`)
			whereClause += ` AND ( ${cols} ) `

			recordsFiltered = db.prepare(`SELECT COUNT(*) AS Count FROM Customer WHERE Deleted=0 ${whereClause}`).get(whereParams).Count
		}

		query += ` ${whereClause} 
		ORDER BY ${req.query.columns[req.query.order[0].column].data} COLLATE NOCASE ${req.query.order[0].dir} 
		LIMIT ${req.query.length} 
		OFFSET ${req.query.start} `

		const customers = db.prepare(query).all(whereParams)


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data: customers
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


/* GET the customer edit page, needs ?id=x */
router.get("/edit", (req, res) => {
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		let customer = db.prepare("SELECT * FROM Customer WHERE CustomerId=?").get(req.query.id)

		if (!customer) {
			customer = {
				CustomerId: 0,
			}
		}

		let salesreps = db.prepare("SELECT Name, Deleted FROM SalesRep ").all()

		res.render ("customer_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Customer`,
			customer,
			user: req.auth.user,
			poweruser: res.locals.poweruser,
			salesrep: res.locals.salesrep,
			salesreps
		})

	}
	finally {
		db.close()
	}

})


// get a list of customers, used by the New Order page
router.get("/ordersearch", function (req, res, next) {

	try {
		const records = customerService.search(req.query.q)
		res.send(records)
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
})


/******************************************************** */



// POST create or new or POST  customer --- deprecated
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


// POST the form from the edit page
router.post("/edit", (req, res) => {
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	const errors = []

	if (!req.body.Code) {
		errors.push("We require a customer code.")
	}
	if (!req.body.Company) {
		errors.push("We require a company name.")
	}

	db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	let count = db.prepare(`SELECT COUNT(*) AS Count FROM Customer WHERE Code=?`).get(req.body.Code).Count
	if ((req.body.CustomerId == 0 && count > 0) 
			|| (req.body.CustomerId != 0 && count > 1) )
		errors.push("We require a unique customer code. Check if the customer already exists.")

	if (errors.length > 0) {
		res.render ("customer_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Customer`,
			customer: req.body,
			errors,
			user: req.auth.user,
			poweruser: res.locals.poweruser,
			salesrep: res.locals.salesrep
		})
	}

	// fix empty strings
	Object.keys(req.body).forEach(k => {
		if (typeof req.body[k] == "string" && req.body[k] == "")
			req.body[k] = null
	})

	// audit columns
	req.body.LastModifiedBy = req.auth.user
	req.body.LastModifiedDateTime = new Date().toLocaleString("en-AU")

	db.prepare("BEGIN TRANSACTION").run()

	try {
		if (req.body.CustomerId == 0) {
			// insert
			delete req.body.CustomerId
			req.body.CreatedBy = req.body.LastModifiedBy
			req.body.CreatedDateTime = req.body.LastModifiedDateTime

			// find properties that have a value
			const changes = []
			Object.keys(req.body).forEach(k => {
				if (req.body[k] != null)
					changes.push(k)
			})

			let query = `INSERT INTO Customer (${changes.join()}) VALUES(${changes.map(c => `@${c}`).join()}) `
			let statement = db.prepare(query)
			let info = statement.run(req.body)
			req.body.CustomerId = info.lastInsertRowid

			query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
			statement = db.prepare(query)
			info = statement.run("Customer", req.body.CustomerId, "INS", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
			const auditLogId = info.lastInsertRowid

			query = "INSERT INTO AuditLogEntry VALUES(null, ?, ?, ?, ?)"
			statement = db.prepare(query)
			changes.forEach(c => {
				if (!auditColumns.includes(c))
					statement.run(auditLogId, c, null, req.body[c])
			})

		} // end insert
		else {
			//update
			let customer = db.prepare("SELECT * FROM Customer WHERE CustomerId=?").get(req.body.CustomerId)

			// find properties that have changed
			const changes = []
			Object.keys(req.body).forEach(k => {
				if (customer[k] != req.body[k])
					changes.push(k)
			})

			if (changes.length > 1) { 
				// LastModifiedDateTime has always changed, so only continue if there is more than that
				let query = `UPDATE Customer SET ${changes.map(c => `${c}=@${c}`).join(", ")} WHERE CustomerId=@CustomerId `
				let statement = db.prepare(query)
				statement.run(req.body)

				query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
				statement = db.prepare(query)
				const info = statement.run("Customer", customer.CustomerId, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
				const auditLogId = info.lastInsertRowid

				query = "INSERT INTO AuditLogEntry VALUES(null, ?, ?, ?, ?)"
				statement = db.prepare(query)
				changes.forEach(c => {
					if (!auditColumns.includes(c))
						statement.run(auditLogId, c, customer[c], req.body[c])
				})

			} // end changes

		} // end update

		db.prepare("COMMIT").run()

		let customer = db.prepare("SELECT * FROM Customer WHERE CustomerId=?").get(req.body.CustomerId)
		let salesreps = db.prepare("SELECT Name, Deleted FROM SalesRep ").all()
		res.render ("customer_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Customer`,
			customer,
			success: "We have saved your changes",
			user: req.auth.user,
			poweruser: res.locals.poweruser,
			salesrep: res.locals.salesrep,
			salesreps
		})

	}
	catch(err) {
		console.log(err)
		res.render ("customer_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Customer`,
			customer: req.body,
			errors: [err.message],
			user: req.auth.user,
			poweruser: res.locals.poweruser,
			salesrep: res.locals.salesrep
		})
	}
	finally {
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
