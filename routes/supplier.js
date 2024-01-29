const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");
const { auditColumns } = require("../config/auditColumns.js");

/* GET Suppliers page. */
router.get("/", function (req, res, next) {
	res.render("supplier.ejs", { 
		title: "Suppliers",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	 })
})


// GET a listing in DataTables format used by datatables ajax
router.get("/dt", function (req, res, next) {
	const db = getDB();

	try {

		const recordsTotal = db.prepare("SELECT COUNT(*) AS Count FROM Supplier WHERE Deleted=0 ").get().Count
		let recordsFiltered = recordsTotal

		let query = `SELECT Supplier.*, s.maxdate FROM Supplier 
		LEFT OUTER JOIN 
		(SELECT SupplierId, MAX(OrderDate) AS maxdate
		FROM StockOrder 
		GROUP BY SupplierId
		) s
		ON  s.SupplierId=Supplier.SupplierId 
		WHERE Deleted=0 `

		let whereParams = []
		let whereClause = ""
		if (req.query.search.value) {
			const searchables = req.query.columns.filter(c => c.searchable == "true")
			const cols = searchables.map(c => `${c.data} LIKE ?`).join(" OR ")
			whereParams = searchables.map(c => `%${req.query.search.value}%`)
			whereClause += ` AND ( ${cols} ) `

			recordsFiltered = db.prepare(`SELECT COUNT(*) AS Count FROM Supplier WHERE Deleted=0 ${whereClause}`).get(whereParams).Count
		}

		query += ` ${whereClause} 
		ORDER BY ${req.query.columns[req.query.order[0].column].data} COLLATE NOCASE ${req.query.order[0].dir} 
		LIMIT ${req.query.length} 
		OFFSET ${req.query.start} `

		const data = db.prepare(query).all(whereParams)


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data
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


// GET the supplier edit page, needs ?id=x
router.get("/edit", (req, res) => {
	const db = getDB();
	try {
		let supplier = db.prepare("SELECT * FROM Supplier WHERE SupplierId=?").get(req.query.id)

		if (!supplier) {
			supplier = {
				SupplierId: 0,
			}
		}

		res.render ("supplier_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Supplier`,
			supplier,
			user: req.auth.user,
			poweruser: res.locals.poweruser,
		})
	}
	finally {
		db.close()
	}

})



/* GET deleted Suppliers page. */
router.get("/deleted", function (req, res, next) {

	const db = getDB();

	const deleted = db.prepare("SELECT * FROM Supplier WHERE DELETED=1 ORDER BY LastModifiedDateTime DESC").all()

	res.render("deleted/suppliers.ejs", {
		title: "Deleted Suppliers",
		user: req.auth.user,
		deleted,
		poweruser: res.locals.poweruser
	})
})


/*************************************************************************** */


/* POST the form from the edit page */
router.post("/edit", (req, res) => {
	const db = getDB();

	const errors = []

	if (!req.body.Code) {
		errors.push("We require a supplier code.")
	}
	if (!req.body.Company) {
		errors.push("We require a supplier name.")
	}

	let count = db.prepare(`SELECT COUNT(*) AS Count FROM Supplier WHERE Code=?`).get(req.body.Code).Count
	if ((req.body.SupplierId == 0 && count > 0) 
			|| (req.body.SupplierId != 0 && count > 1) )
		errors.push("We require a unique supplier code. Check if the supplier already exists.")

	if (errors.length > 0) {
		res.render ("supplier_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Supplier`,
			supplier: req.body,
			errors,
			user: req.auth.user,
			poweruser: res.locals.poweruser,
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
		if (req.body.SupplierId == 0) {
			delete req.body.SupplierId
			// insert
			req.body.CreatedBy = req.body.LastModifiedBy
			req.body.CreatedDateTime = req.body.LastModifiedDateTime

			// find properties that have a value
			const changes = []
			Object.keys(req.body).forEach(k => {
				if (req.body[k] != null)
					changes.push(k)
			})

			let query = `INSERT INTO Supplier (${changes.join()}) VALUES(${changes.map(c => `@${c}`).join()}) `
			let statement = db.prepare(query)
			let info = statement.run(req.body)
			req.body.SupplierId = info.lastInsertRowid

			query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
			statement = db.prepare(query)
			info = statement.run("Supplier", req.body.SupplierId, "INS", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
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
			let supplier = db.prepare("SELECT * FROM Supplier WHERE SupplierId=?").get(req.body.SupplierId)

			// find properties that have changed
			const changes = []
			Object.keys(req.body).forEach(k => {
				if (supplier[k] != req.body[k])
					changes.push(k)
			})

			if (changes.length > 1) { 
				// LastModifiedDateTime has always changed, so only continue if there is more than that
				let query = `UPDATE Supplier SET ${changes.map(c => `${c}=@${c}`).join(", ")} WHERE SupplierId=@SupplierId `
				let statement = db.prepare(query)
				statement.run(req.body)

				query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
				statement = db.prepare(query)
				const info = statement.run("Supplier", supplier.SupplierId, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
				const auditLogId = info.lastInsertRowid

				query = "INSERT INTO AuditLogEntry VALUES(null, ?, ?, ?, ?)"
				statement = db.prepare(query)
				changes.forEach(c => {
					if (!auditColumns.includes(c)) 
						statement.run(auditLogId, c, supplier[c], req.body[c])
				})

			} // end changes

		} // end update

		db.prepare("COMMIT").run()

		let supplier = db.prepare("SELECT * FROM Supplier WHERE SupplierId=?").get(req.body.SupplierId)
		res.render ("supplier_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Supplier`,
			supplier,
			success: "We have saved your changes",
			user: req.auth.user,
			poweruser: res.locals.poweruser,
		})

	}
	catch(err) {
		console.log(err)
		res.render ("supplier_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Supplier`,
			supplier: req.body,
			errors: [err.message],
			user: req.auth.user,
			poweruser: res.locals.poweruser,
		})
	}
	finally {
		db.close()
	}
})



/// POST to create a new supplier via fetch --- deprecated
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

	const db = getDB();

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
		const newId = info.lastInsertRowid

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
			id: newId
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


// PUT to edit an existing supplier via fetch   --- deprecated
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

	const db = getDB();

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
		for (var key in mySupplier) {
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
				message: "success",
				id: req.params.id 
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

	const db = getDB();

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




// DELETE an existing supplier
router.delete("/:id", function(req, res) {
	const errors = []
	const db = getDB();
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