const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");
const { locations } = require("../config/art.js");


/* GET Basic embroidery design page. */
router.get("/", function (req, res, next) {
	res.render("embroiderydesign.ejs", {
		title: "Embroidery Designs",
		stylesheets: ["/stylesheets/printdesign-theme.css"],
		user: req.auth.user,
		locations: locations,
		poweruser: res.locals.poweruser
	})
})


// GET a list of embroidery, used on the new order page
router.get("/ordersearch", function (req, res, next) {

	const getDB = require("../integration/dbFactory");
	try {
		// note that "Womens" returns same result as "Adults"
		const statement = db.prepare(`SELECT DISTINCT EmbroideryDesign.EmbroideryDesignId, Code, EmbroideryDesign.Notes, Comments 
FROM EmbroideryDesign 
INNER JOIN UsbEmbroideryDesign ON EmbroideryDesign.EmbroideryDesignId=UsbEmbroideryDesign.EmbroideryDesignId  
INNER JOIN Usb ON Usb.UsbId = UsbEmbroideryDesign.UsbId
WHERE (Code LIKE '%${req.query.q}%' OR EmbroideryDesign.Notes LIKE '%${req.query.q}%') 

AND EmbroideryDesign.Deleted=0 
AND Usb.Deleted=0 
ORDER BY EmbroideryDesign.Notes `)
// AND SizeCategory = '${req.query.sizes == 'Kids' ? 'Kids' : 'Adults'}'  
// we have taken this out because they decided that any usb could go on any size product, ignoring size categories
// that means that the query string parameter "sizes" is ignored
// but they might decide to change their minds


		const records = statement.all()
		res.send(records).end()

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}

})


// GET a list of usbs for a embroidery design, used on the new order page
router.get("/usb/ordersearch", function (req, res, next) {
	const db = getDB();
	try {

		// "Womens" and "Adults" are the same
		const statement = db.prepare(`SELECT UsbEmbroideryDesignId, UsbEmbroideryDesign.UsbId, Front, Back, Pocket, Sleeve, Number, Notes
FROM UsbEmbroideryDesign 
INNER JOIN Usb on Usb.UsbId = UsbEmbroideryDesign.UsbId 
AND EmbroideryDesignId = ${req.query.embroiderydesignid} 
AND Usb.Notes IS NOT NULL 

 `)
// AND SizeCategory = '${req.query.sizes == 'Kids' ? 'Kids' : 'Adults'}' 
// we have taken this out because they decided that any usb could go on any size product, ignoring size categories
// that means that the query string parameter "sizes" is ignored
// but they might decide to change their minds


		const records = statement.all()
		res.send(records)
		db.close()
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


// GET list of embroidery designs in DataTables format
router.get("/dt", function (req, res, next) {

	const db = getDB();

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) as Count FROM EmbroideryDesign WHERE Deleted=0 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = " WHERE Deleted=0"
		if (req.query.search.value)
			req.query.search.value = req.query.search.value.trim()
		if (req.query.search.value) {

			whereClause += ` AND (Code LIKE '%${req.query.search.value}%' OR Notes LIKE '%${req.query.search.value}%' OR Comments LIKE '%${req.query.search.value}%') `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM EmbroideryDesign ${whereClause}`)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT * FROM EmbroideryDesign ${whereClause} `

		const columns = ["EmbroideryDesignId", "", "Code", "Notes", "Comments"]
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
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db && db.close()
	}

})


// GET the usbs that are related to this embroidery design
// used by the datatables format function when you click to expand a row
router.get("/usbs/:id", function (req, res) {

	const db = getDB();

	try {
		const statement = db.prepare(`SELECT UsbEmbroideryDesignId, SizeCategory, Front, Back, Pocket, Sleeve, Usb.UsbId AS UsbId ,Number as UsbNumber, Notes as UsbNotes 
		FROM UsbEmbroideryDesign 
		LEFT JOIN Usb ON Usb.UsbId=UsbEmbroideryDesign.UsbId 
		WHERE EmbroideryDesignId=?
		AND Usb.Deleted=0`)
		const usbs = statement.all(req.params.id)
		res.send(usbs).end()
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}

})


// GET page of deleted designs
router.get("/deleted", (req, res) => {

	const db = getDB();

	const deleted = db.prepare("SELECT * FROM EmbroideryDesign WHERE DELETED=1 ORDER BY LastModifiedDateTime DESC").all()

	res.render("deleted/embroideries.ejs", {
		title: "Deleted Embroidery Designs",
		user: req.auth.user,
		deleted,
		poweruser: res.locals.poweruser
	})

})

// POST create a new embroidery design
router.post("/", function (req, res) {
	const db = getDB();

	if (req.body.Code == "") {
		res.statusMessage = "We require a code."
		res.status(400)
		return
	}

	try {
		let statement = db.prepare(`SELECT COUNT(*) as Count FROM EmbroideryDesign WHERE Code=?`)
		const count = statement.get(req.body.Code).Count
		if (count >= 1) {
			res.statusMessage = "We are already using that code."
			res.status(400)
			return
		}

		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()

		const columns = []
		for (const column in req.body) {
			if (req.body[column]) {
				columns.push(column)
			}
		}

		db.prepare("BEGIN TRANSACTION").run()


		let query = `INSERT INTO EmbroideryDesign ( 
		${columns.join(", ")}
		) VALUES (
		${columns.map(c => `@${c}`).join(", ")})`
		statement = db.prepare(query)


		let info = statement.run(req.body)
		res.send({ message: "Success", id: info.lastInsertRowid }).end()
		console.log(info)


		// now insert into Audit Log

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Embroidery", info.lastInsertRowid, "INS", req.body.CreatedBy, req.body.CreatedDateTime)
		console.log(info)

		// now add it to AuditLogEntry
		for (const column of columns) {
			if (column.startsWith("Created") || column.startsWith("LastM"))
				continue
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, NewValue) VALUES(?, ?, ?)")
			statement.run(info.lastInsertRowid, column, req.body[column])
		}

		db.prepare("COMMIT").run()

	}
	catch (ex) {
		console.log(ex)
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}
})



// POST create a new UsbEmbroideryDesign 
router.post("/usb", function (req, res) {
	const db = getDB();

	try {

		let query = `SELECT COUNT(*) AS Count 
		FROM UsbEmbroideryDesign 
		WHERE
		UsbId = ? 
		 `
		 // AND SizeCategory =? --no longer relevant but may need to be restored
		if (req.body.Front == 1)
			query += " AND Front=1 "
		if (req.body.Back == 1)
			query += " AND Back=1 "
		if (req.body.Pocket == 1)
			query += "AND Pocket=1 "
		if (req.body.Sleeve == 1)
			query += "AND Sleeve=1 "

		let statement = db.prepare(query)
		const count = statement.get(req.body.UsbId) // , req.body.SizeCategory --no longer relevant but may need to be restored

		if (count > 0) {
			res.statusMessage = "We already have that location and size"
			res.status(400).end()
			return
		}

		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()

		const columns = []
		for (col in req.body)
			if (req.body[col])
				columns.push(col)

		query = `INSERT INTO UsbEmbroideryDesign (
			${columns.join(", ")}
			) VALUES (
			${columns.map(c => `@${c}`).join(", ")}
			) `
		statement = db.prepare(query)

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(req.body)

		res.json({
			message: "success",
			id: info.lastInsertRowid
		}).end()
		console.log("info")


		// now insert into Audit Log
		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("UsbEmbroideryDesign", info.lastInsertRowid, "INS", req.body.CreatedBy, req.body.CreatedDateTime)
		console.log(info)

		// now add it to AuditLogEntry
		for (const column of columns) {
			if (column.startsWith("Created") || column.startsWith("LastM"))
				continue
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, NewValue) VALUES(?, ?, ?)")
			statement.run(info.lastInsertRowid, column, req.body[column])
		}

		db.prepare("COMMIT").run()

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		console.log(ex)
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		if (db != null)
			db.close()
	}


})



// GET data for datatables for deleted EmbroideryDesigns
router.post("/deleted/dt", function(req, res) {
	const db = getDB();

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) AS Count FROM EmbroideryDesign WHERE Deleted=1 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = " WHERE Deleted=1 "
		if (req.body["search[value]"]) {
			whereClause += ` AND (Code LIKE '%${req.body["search[value]"]}%' OR Notes LIKE '%${req.body["search[value]"]}%'
				) `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM EmbroideryDesign ${whereClause} `)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT EmbroideryDesignId, Code, Notes, Comments, LastModifiedBy, LastModifiedDateTime FROM EmbroideryDesign ${whereClause}  `
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




// PUT update/edit existing embroidery design
router.put("/:id", function (req, res) {
	const db = getDB();
	try {

		if (req.body.Code == "") {
			res.statusMessage = "We require a code."
			res.status(400).end()
			return
		}

		let statement = db.prepare(`SELECT COUNT(*) as Count FROM EmbroideryDesign WHERE Deleted=0 AND Code=? AND EmbroideryDesignId <> ?`)
		const count = statement.get(req.body.Code, req.params.id).Count
		if (count >= 1) {
			res.statusMessage = "We are already using that code."
			res.status(400).end()
			return
		}

		const myDesign = db.prepare("SELECT * From EmbroideryDesign WHERE EmbroideryDesignId=?").get(req.params.id)

		req.body.EmbroideryDesignId = req.params.id


		const columns = []
		for (const col in req.body) {
			req.body[col] = req.body[col].trim()
			if (req.body[col] != myDesign[col])
				columns.push(col)
		}
		if (columns.length == 0) {
			res.statusMessage = "Nothing changed."
			res.status(400).end()
			return
		}

		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = new Date().toLocaleString()
		columns.push("LastModifiedBy", "LastModifiedDateTime")


		const query = `UPDATE EmbroideryDesign SET ${columns.map(c => `${c}=@${c}`).join(", ")} WHERE EmbroideryDesignId=@EmbroideryDesignId`
		statement = db.prepare(query)

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(req.body)
		res.send({ message: "Success" }).end()
		console.log(info)

		// now add it to audit logs
		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("EmbroideryDesign", req.params.id, "UPD", req.auth.user, req.body.LastModifiedDateTime)


		// now add it to audit log entry
		for (let col of columns) {
			if (col.startsWith("LastM"))
				continue
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
			statement.run(info.lastInsertRowid, col, myDesign[col], req.body[col])
		}

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


// PUT edit by setting deleted to 0
router.put("/restore/:id", (req, res) => {

	const db = getDB();

	try {
		const date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE EmbroideryDesign SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE EmbroideryDesignId=?")

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(req.auth.user, date, req.params.id)
		res.send("ok").end()

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("EmbroideryDesign", req.params.id, "UPD", req.auth.user, date)

		statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES (?, ?, ?, ?)")
		info = statement.run(info.lastInsertRowid, "Deleted", 1, 0)

		db.prepare("COMMIT").run()

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



// DELETE an existing embroidery design
router.delete("/:id", function (req, res) {
	const db = getDB();
	try {
		const date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE EmbroideryDesign SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE EmbroideryDesignId=?")

		db.prepare("BEGIN TRANSACTION").run()

		statement.run(req.auth.user, date, Number(req.params.id))

		let info = statement.run(req.params.id)
		res.send("ok").end()
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("EmbroideryDesign", req.params.id, "DEL", req.auth.user, date)
		console.log(info)
		// no AuditLogEntry, assumed as OldValue=0 NewValue=1

		db.prepare("COMMIT").run()


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



router.delete("/removeusb/:id", (req, res) => {
	const db = getDB();
	try {
		const oldEntry = db.prepare("SELECT * FROM UsbEmbroideryDesign WHERE UsbEmbroideryDesignId=?").get(req.params.id)

		const date = new Date().toLocaleString()
		let statement = db.prepare(`DELETE FROM UsbEmbroideryDesign WHERE UsbEmbroideryDesignId=?`)

		db.prepare("BEGIN TRANSACTION").run()

		info = statement.run(req.params.id)
		res.send({ message: "success" }).end()
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("UsbEmbroideryDesign", req.params.id, "DEL", req.auth.user, date)
		const auditLogId = info.lastInsertRowid
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue) VALUES (?, ?, ?)")
		const props = ["UsbId", "EmbroideryDesignId", "SizeCategory", "Front", "Back", "Pocket", "Sleeve"]
		props.forEach(prop => {
			info = statement.run(auditLogId, prop, oldEntry[prop])
			console.log(info)
		})


		db.prepare("COMMIT").run()
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




module.exports = router