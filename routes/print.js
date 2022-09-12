const express = require("express")
const router = express.Router()
const Database = require("better-sqlite3")
const sz = require("../sizes.js")


/* GET Basic print design page. */
router.get("/", function (req, res, next) {
	res.render("printdesign.ejs", {
		title: "Print Designs",
		user: req.auth.user,
		locations: JSON.stringify(sz.locations)
	})
})

// GET datatables server side processing on Print Design page
router.get("/dt", function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) as Count FROM PrintDesign WHERE Deleted=0")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = "WHERE Deleted = 0 "
		if (req.query.search.value)
			req.query.search.value = req.query.search.value.trim()
		if (req.query.search.value) {
			whereClause += ` AND (Code LIKE '%${req.query.search.value}%' OR Notes LIKE '%${req.query.search.value}%' OR Comments LIKE '%${req.query.search.value}%') `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM PrintDesign ${whereClause}`)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT * FROM PrintDesign ${whereClause} `

		const columns = ["PrintDesignId", "", "Code", "Notes", "Comments"]
		const orderByClause = req.query.order.map(o => ` ${columns[o.column]} COLLATE NOCASE ${o.dir} `)
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`
		const data = db.prepare(query).all()

		// get the last date this was on an order
		// NOTE one day, we should put the max values in view and join to that, so it can be sortable
		statement = db.prepare("SELECT max(orderdate) AS maxdate FROM Sales WHERE FrontPrintDesignId=@id OR BackPrintDesignId=@id OR SleevePrintDesignId=@id OR PocketPrintDesignId=@id")
		for (const print of data) {
			const maxdate = statement.get({ id: print.PrintDesignId }).maxdate
			if (maxdate)
				print.maxdate = new Date(Date.parse(maxdate)).toLocaleDateString()
			else
				print.maxdate = "never"

		}


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data
		}).end()

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}

})


// GET a list of relevant screens on the Print Design page
router.get("/screens/:id", function (req, res) {

	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })


	try {

		const statement = db.prepare(`SELECT ScreenPrintDesignId, SizeCategory, Front, Back, Pocket, Sleeve, Screen.ScreenId, Name as ScreenName, Number as ScreenNumber, Colour as ScreenColour 
		FROM ScreenPrintDesign 
		LEFT JOIN Screen ON Screen.ScreenId = ScreenPrintDesign.ScreenId 
		WHERE PrintDesignId=?
		AND Screen.Deleted=0
		ORDER BY Name, Number, Colour`)
		const screens = statement.all(req.params.id)

		res.send(screens).end()
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}

})


// GET a list of print designs for the new orders page
router.get("/ordersearch", function (req, res, next) {

	const db = new Database("sunprints.db", {
		verbose: console.log,
		fileMustExist: true
	})

	try {
		// note that "Womens" and "Adults" return the same
		const statement = db.prepare(`SELECT DISTINCT PrintDesign.PrintDesignId, Code, Notes, Comments 
FROM PrintDesign 
INNER JOIN ScreenPrintDesign ON PrintDesign.PrintDesignId=ScreenPrintDesign.PrintDesignId  
INNER JOIN Screen ON Screen.ScreenId = ScreenPrintDesign.ScreenId
WHERE (Code LIKE '%${req.query.q}%' OR Notes LIKE '%${req.query.q}%') 

AND PrintDesign.Deleted=0 
AND Screen.Deleted=0
ORDER BY Notes `)
// --AND SizeCategory = '${req.query.sizes == 'Kids' ? 'Kids' : 'Adults'}' 
// we have taken this out because they decided that any screen could go on any size product, ignoring size categories
// that means that the query string parameter "sizes" is ignored
// but they might decide to change their minds, so I'm not deleting it


		const records = statement.all()
		res.send(records)

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {

		db.close()
	}

})


// GET page of deleted designs
router.get("/deleted", (req, res) => {
	res.render("deleted/prints.ejs", {
		title: "Deleted Print Designs",
		user: req.auth.user
	})

})



/*************************************************************************** */


// POST data for datatables for deleted PrintDesigns
router.post("/deleted/dt", function(req, res) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) AS Count FROM PrintDesign WHERE Deleted=1 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = " WHERE Deleted=1 "
		if (req.body["search[value]"]) {
			whereClause += ` AND (Code LIKE '%${req.body["search[value]"]}%' OR Notes LIKE '%${req.body["search[value]"]}%' ) `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM PrintDesign ${whereClause} `)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT PrintDesignId, Code, Notes, Comments, LastModifiedBy, LastModifiedDateTime FROM PrintDesign ${whereClause}  `
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



// POST insert a new print design
router.post("/", function (req, res) {

	if (req.body.Code == "") {
		res.statusMessage = "We require a code."
		res.status(400).end()
		return
	}

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		let statement = db.prepare(`SELECT COUNT(*) as Count FROM PrintDesign WHERE Code=?`)
		const count = statement.get(req.body.Code).Count
		if (count >= 1) {
			res.statusMessage = `We are already using that code (${req.body.Code}).`
			res.status(400).end()
			return
		}

		// go ahead and insert it
		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()

		let query = "INSERT INTO PrintDesign ( "

		const columns = []
		for (const column in req.body)
			if (req.body[column])
				columns.push(column)
		query += columns.join(", ")
		query += " ) VALUES ( "
		query += columns.map(c => `@${c}`).join(", ")
		query += ")"

		statement = db.prepare(query)
		let info = statement.run(req.body)
		res.send({ message: "Success", id: info.lastInsertRowid })

		// now insert into Audit Log
		try {
			db.prepare("BEGIN TRANSACTION").run()

			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("PrintDesign", info.lastInsertRowid, "INS", req.body.CreatedBy, req.body.CreatedDateTime)

			// now add it to AuditLogEntry
			for (const column of columns) {
				if (column.startsWith("Created") || column.startsWith("LastM"))
					continue
				statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, NewValue) VALUES(?, ?, ?)")
				statement.run(info.lastInsertRowid, column, req.body[column])
			}

			db.prepare("COMMIT").run()
		}
		catch (err) {
			db.prepare("ROLLBACK").run()
			// we ignore the error, if it went into the other catch block, .end() would be called twice, we can't have that
		}

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
		db.prepare("ROLLBACK").run()
	}
	finally {
		db.close()
	}
})


// POST Insert/Create an intem in ScreenPrintDesign, used by the list of print designs
router.post("/screen/add", (request, response) => {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		let query = `SELECT COUNT(*) AS Count 
		FROM ScreenPrintDesign 
		WHERE
		ScreenId=?
		 `
		//AND SizeCategory=? --removed because no longer relevant

		if (request.body.Front == 1)
			query += " AND Front=1 "
		if (request.body.Back == 1)
			query += " AND Back=1 "
		if (request.body.Pocket == 1)
			query += "AND Pocket=1 "
		if (request.body.Sleeve == 1)
			query += "AND Sleeve=1 "

		let statement = db.prepare(query)
		const count = statement.get(request.body.ScreenId) // , request.body.SizeCategory -- removed because no longer relevant

		if (count > 0) {
			response.statusMessage = "We already have that location"
			response.status(400).end()
			return
		}

		request.body.CreatedBy = request.body.LastModifiedBy = request.auth.user
		request.body.CreatedDateTime = request.body.LastModifiedDateTime = new Date().toLocaleString()

		const columns = []
		for (column in request.body) {
			if (request.body[column]) {
				columns.push(column)
			}
		}
		query = `INSERT INTO ScreenPrintDesign ( 
			SizeCategory,
			${columns.join(", ")}
			) VALUES ( 
				'Adults,Kids',
				${columns.map(col => `@${col}`).join(", ")}
			)`
		statement = db.prepare(query)

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(request.body)
		response.json({
			message: "success",
			id: info.lastInsertRowid
		}).end()
		console.log(info)


		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("ScreenPrintDesign", info.lastInsertRowid, "INS", request.body.CreatedBy, request.body.CreatedDateTime)

		// now add it to AuditLogEntry
		for (const column of columns) {
			if (column.startsWith("Created") || column.startsWith("LastM"))
				continue
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, NewValue) VALUES(?, ?, ?)")
			statement.run(info.lastInsertRowid, column, request.body[column])
		}

		db.prepare("COMMIT").run()

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		response.statusMessage = ex.message
		response.status(400).end()
	}
	finally {
		db.close()
	}


})


/*************************************************************************** */


// PUT edit a print design,
router.put("/:id", function (req, res) {



	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	if (req.body.Code == "") {
		res.statusMessage = `We require a code.`
		res.status(400).end()
		return
	}

	try {
		let statement = db.prepare(`SELECT COUNT(*) as Count FROM PrintDesign WHERE Code=? AND PrintDesignId <> ?`)
		const count = statement.get(req.body.Code, req.params.id).Count
		if (count > 1) {
			res.statusMessage = `We are already using that code (req.body.Code) `
			res.status(400).end()
			return
		}

		statement = db.prepare(`SELECT * FROM PrintDesign WHERE PrintDesignId=?`)
		const myDesign = statement.get(req.params.id)

		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = new Date().toLocaleString()
		req.body.PrintDesignId = Number(req.params.id)

		const changed = []
		for (const column in req.body)
			if (myDesign[column] !== req.body[column])
				changed.push(column)

		let query = "UPDATE PrintDesign SET  "
		query += changed.map(col => `${col} = @${col}`).join(", ")
		query += " WHERE PrintDesignId=@PrintDesignId"

		statement = db.prepare(query)
		let info = statement.run(req.body)
		res.send({ message: "Success" }).end()

		// now add it to audit logs
		try {
			db.prepare("BEGIN TRANSACTION").run()
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("PrintDesign", req.params.id, "UPD", req.auth.user, req.body.LastModifiedDateTime)


			// now add it to audit log entry
			for (let col of changed) {
				if (col.startsWith("LastM"))
					continue
				statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
				statement.run(info.lastInsertRowid, col, myDesign[col], req.body[col])
			}

			db.prepare("COMMIT").run()
		}
		catch (ex) {
			db.prepare("ROLLBACK").run()
			// do nothing, because the response has already ended. 
			// if we threw the error, then it would be caught and the .end() would have been called twice
		}


	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}
})


// PUT edit by setting deleted to 0
router.put("/restore/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		db.prepare("BEGIN TRANSACTION").run()

		const date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE PrintDesign SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE PrintDesignId=?")
		let info = statement.run(req.auth.user, date, req.params.id)
		res.send("ok").end()

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("PrintDesign", req.params.id, "UPD", req.auth.user, date)

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


/*************************************************************************** */


// DELETE, soft delete, set Deleted to 0
router.delete("/:id", function (req, res) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		const deleteDate = new Date().toLocaleString()
		let statement = db.prepare(`UPDATE PrintDesign SET Deleted = 1, LastModifiedBy=?, LastModifiedDateTime=? WHERE PrintDesignId=? `)

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(req.auth.user, deleteDate, req.params.id)
		res.send({ message: "Success" }).end()

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("PrintDesign", req.params.id, "DEL", req.auth.user, deleteDate)
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


// DELETE remove a ScreenPrintDesign entry
router.delete("/removescreen/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		const myScreenPrintDesign = db.prepare("SELECT * FROM ScreenPrintDesign WHERE ScreenPrintDesignId=?").get(req.params.id)

		const date = new Date().toLocaleString()
		let statement = db.prepare(`DELETE FROM ScreenPrintDesign WHERE ScreenPrintDesignId=?`)

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(req.params.id)
		res.send({ message: "success" }).end()
		console.log(info)


		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("ScreenPrintDesign", req.params.id, "DEL", req.auth.user, date)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, null)")
		statement.run(info.lastInsertRowid, "PrintDesignId", myScreenPrintDesign.PrintDesignId)
		statement.run(info.lastInsertRowid, "ScreenId", myScreenPrintDesign.ScreenId)
		statement.run(info.lastInsertRowid, "SizeCategory", myScreenPrintDesign.SizeCategory)
		statement.run(info.lastInsertRowid, "Front", myScreenPrintDesign.Front)
		statement.run(info.lastInsertRowid, "Back", myScreenPrintDesign.Back)
		statement.run(info.lastInsertRowid, "Pocket", myScreenPrintDesign.Pocket)
		statement.run(info.lastInsertRowid, "Sleeve", myScreenPrintDesign.Sleeve)


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