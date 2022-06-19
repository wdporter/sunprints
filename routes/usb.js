const express = require("express")
const router = express.Router()

const Database = require("better-sqlite3")



/* GET Usbs page. */
router.get("/", function (req, res, next) {
	res.render("usb.ejs", { 
		title: "Usb",
		user: req.auth.user
	 })
})


/* get usbs, filtered by term, used on Print Design page */
router.get("/filter/:term", function(req, res) {

	let db = null
	try {
		const term = `%${req.params.term}%`
		db = db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
		const statement = db.prepare(`SELECT * FROM Usb WHERE Deleted=0 AND Number LIKE @term OR Notes LIKE @term `)
		const usbs = statement.all({term})

		const ret = {
			items: usbs.slice(0, 100),
			count: usbs.length
		}

		res.send(ret)

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


/* get usbs for data tables server side processing */
router.get("/dt", function(req, res) {

	let db = null

	try {
		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
		
		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) as Count FROM Usb WHERE Deleted=0 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let query = "SELECT * FROM Usb "
		let	whereClause = " WHERE Deleted=0 "
		if (req.query.search.value)
			req.query.search.value = req.query.search.value.trim()
		if (req.query.search.value) {
			whereClause += ` AND (Number LIKE '%${req.query.search.value}%' OR Notes LIKE '%${req.query.search.value}%' ) `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM Usb ${whereClause}`)
			recordsFiltered = statement.get().Count
		}

		query += whereClause

		const columns = ["UsbId", "Number", "Notes"]
		const orderByClause = req.query.order.map(o => ` ${columns[o.column]} COLLATE NOCASE ${o.dir} `)
		query += ` ORDER BY ${orderByClause.join(",")}`

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
		res.status(400).json({ "error": errors.join(",") })
	}
	finally {
		if (db != null)
			db.close()
	}

})


// GET page of deleted usbs
router.get("/deleted", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	const deleted = db.prepare("SELECT * FROM Usb WHERE DELETED=1 ORDER BY LastModifiedDateTime DESC").all()

	res.render("deleted/usbs.ejs", {
		title: "Deleted USBs",
		user: req.auth.user,
		deleted
	})

	db.close()

})


/*************************************************************************** */


/// POST to create a new usb
router.post("/", function(req, res) {
	
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()

		if (!req.body.Number && !req.body.Notes) {
			res.statusMessage = "Nothing to insert"
			res.sendStatus(400).end()
		}

		const columns = ["CreatedBy", "CreatedDateTime", "LastModifiedBy", "LastModifiedDateTime"]
		if (req.body.Number) {
			columns.push("Number")
		}
		if (req.body.Notes) {
			columns.push("Notes")
		}
		
		db.prepare("BEGIN TRANSACTION").run()


		let statement = db.prepare(`INSERT INTO Usb ( ${columns.join(", ")}
) VALUES (
${columns.map(c => `@${c}`).join(", ")}
)`)
		let info = statement.run(req.body)
		res.json({
			message: "success",
			id: info.lastInsertRowid
		}).end()
		console.log("info")

		// now insert into Audit Log

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Embroidery", info.lastInsertRowid, "INS", req.body.CreatedBy, req.body.CreatedDateTime)
		console.log(info)

		// now add it to AuditLogEntry
		statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, NewValue) VALUES(?, ?, ?)")
		if (req.body.Notes) {
			statement.run(info.lastInsertRowid, "Notes", req.body.Notes)
		}
		if (req.body.Number) {
			statement.run(info.lastInsertRowid, "Number", req.body.Number)
		}
		

		db.prepare("COMMIT").run()


	}
	catch(ex) {
		res.statusMessage = ex.message
		res.status(400).end()
		db.prepare("ROLLBACK").run()
		console.log(ex)
}
	finally {
		db.close()
	}
})


// GET data for datatables for deleted Usb
router.post("/deleted/dt", function(req, res) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) AS Count FROM Usb WHERE Deleted=1 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = " WHERE Deleted=1 "
		if (req.body["search[value]"]) {
			whereClause += ` AND (Number LIKE '%${req.body["search[value]"]}%' OR Notes LIKE '%${req.body["search[value]"]}%'
				) `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM Usb ${whereClause} `)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT UsbId, Number, Notes, LastModifiedBy, LastModifiedDateTime FROM Usb ${whereClause}  `
		query += ` ORDER BY ${parseInt(req.body["order[0][column]"]) + 1} COLLATE NOCASE ${req.body["order[0][dir]"]} `
		query += ` LIMIT ${req.body.length} OFFSET ${req.body.start}`
		const data = db.prepare(query).all()


		res.send({
			draw: Number(req.body.draw),
			recordsTotal,
			recordsFiltered,
			data
		})
	}
	catch(ex) {
		console.log(ex.message)
	}
	finally {
		db.close()
	}
})



/*************************************************************************** */


// PUT to edit an existing usb
router.put("/:id", function(req, res) {
	
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	req.body.UsbId = Number(req.params.id)

	try {
		req.body.LastModifiedDateTime = new Date().toLocaleString()
		req.body.LastModifiedBy = req.auth.user
		
		const myUsb = db.prepare("SELECT * FROM Usb WHERE UsbId=?").get(req.params.id)

		const columns = []
		if (req.body.Number != myUsb.Number)
			columns.push("Number")
		if (req.body.Notes != myUsb.Notes)
			columns.push("Notes")

		if (columns.length == 0) {
			res.statusMessage = "nothing to update"
			res.sendStatus(400).end()
			return
		}

		columns.push("LastModifiedBy", "LastModifiedDateTime")

		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare(`UPDATE Usb SET ${columns.map(c => `${c}=@${c}`).join(", ")}
			WHERE UsbId = @UsbId `)
		let info = statement.run(req.body)
		res.json({
			message: "success"
		}).end()
		console.log(info)


		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Usb", req.params.id, "UPD", req.auth.user, req.body.LastModifiedDateTime)
			console.log(info)


			// now add it to audit log entry
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
			if (columns.Number)
				statement.run(info.lastInsertRowid, "Number", myUsb.Number, req.body.Number)
			if (columns.Number)
				statement.run(info.lastInsertRowid, "Notes", myUsb.Notes, req.body.Notes)


			db.prepare("COMMIT").run()

	}
	catch(ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		if (db != null)
			db.close()
	}

})



// PUT edit by setting deleted to 0
router.put("/restore/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		const date = new Date().toLocaleString()
		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare("UPDATE Usb SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE UsbId=?")
		let info = statement.run(req.auth.user, date, req.params.id)
		res.send("ok").end()
		console.log(info)


			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Usb", req.params.id, "UPD", req.auth.user, date)
			console.log(info)

			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES (?, ?, ?, ?)")
			info = statement.run(info.lastInsertRowid, "Deleted", 1, 0)
			console.log(info)

			db.prepare("COMMIT").run()

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		console.log(ex)
		res.statusMessage = ex.message
		res.status(400).end()
	}

	finally {
		db.close()
	}

})


/*************************************************************************** */


// DELETE  an existing usb
router.delete("/:id", function(req, res) {
	
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		db.prepare("BEGIN TRANSACTION").run()

		let date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE Usb SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE UsbId=?")
		let info = statement.run(req.auth.user, date, req.params.id)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Usb", req.params.id, "DEL", req.auth.user, date)
		console.log(info)

		db.prepare("COMMIT").run()

		res.json({
			message: "success"
		}).end()
		console.log(info)


	}
	catch(ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}

})







module.exports = router