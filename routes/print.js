const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");
const { auditColumns } = require("../config/auditColumns.js");
const { locations } = require("../config/art.js");

const {standardScreens} = require("../service/printDesignService")


/* GET Basic print design page. */
//experimental 
router.get("/2", function (req, res, next) {
	res.render("printdesign2.ejs", {
		title: "Print Designs",
		stylesheets: [],//["/stylesheets/printdesign-theme.css"],
		user: req.auth.user,
		poweruser: res.locals.poweruser
	})
})


// GET a listing in DataTables format used by datatables ajax
//experimental 
router.get("/dt2", function (req, res, next) {
	const db = getDB();

	try {

		const recordsTotal = db.prepare("SELECT COUNT(*) AS Count FROM PrintDesign WHERE Deleted=0 ").get().Count
		let recordsFiltered = recordsTotal

		let query = `SELECT PrintDesign.* FROM PrintDesign WHERE Deleted=0 `

		let whereParams = []
		let whereClause = ""
		if (req.query.search.value) {
			const searchables = req.query.columns.filter(c => c.searchable == "true")
			const cols = searchables.map(c => `${c.data} LIKE ?`).join(" OR ")
			whereParams = searchables.map(c => `%${req.query.search.value}%`)
			whereClause += ` AND ( ${cols} ) `

			recordsFiltered = db.prepare(`SELECT COUNT(*) AS Count FROM PrintDesign WHERE Deleted=0 ${whereClause}`).get(whereParams).Count
		}

		query += ` ${whereClause} 
		ORDER BY ${req.query.columns[req.query.order[0].column].data} COLLATE NOCASE ${req.query.order[0].dir} 
		LIMIT ${req.query.length} 
		OFFSET ${req.query.start} `

		const data = db.prepare(query).all(whereParams)


		res.send({
			draw: parseInt(req.query.draw),
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



// GET print design edit page, needs ?id=[0|n]
//experimental 
router.get("/edit", (req, res) => {
	const db = getDB();

	try {
		let printdesign = db.prepare("SELECT * FROM PrintDesign WHERE PrintDesignId=?").get(req.query.id)

		if (!printdesign) {
			printdesign = {
				PrintDesignId: 0,
			}
		}

		res.render ("printdesign_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Print Design`,
			printdesign,
			user: req.auth.user,
			poweruser: res.locals.poweruser,
			success: false,
			errors: []
		})
	}
	finally {
		db.close()
	}
})



/* GET Basic print design page. */
router.get("/", function (req, res, next) {
	res.render("printdesign.ejs", {
		title: "Print Designs",
		stylesheets: ["/stylesheets/printdesign-theme.css"],
		user: req.auth.user,
		locations: JSON.stringify(locations),
		poweruser: res.locals.poweruser
	})
})




// GET datatables server side processing on Print Design page
router.get("/dt", function (req, res, next) {

	const db = getDB();

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

	const db = getDB();

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

	const db = getDB();

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
		user: req.auth.user,
		poweruser: res.locals.poweruser
	})

})


// GET The standard screens for the given print design id
router.get("/:printdesignid/standardscreens", (req, res) => {

	res.json(standardScreens(req.params.printdesignid))


})



/*************************************************************************** */



// POST the form from the edit page
router.post("/edit", (req, res) => {
	const db = getDB();

	const errors = []

	if (!req.body.Code) {
		errors.push("We require a code.")
	}

	if (errors.length > 0) {
		res.render ("printdesign_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Print Design`,
			printdesign: req.body,
			errors,
			success: false,
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
		if (req.body.PrintDesignId == 0) {
			// insert
			delete req.body.PrintDesignId
			req.body.CreatedBy = req.body.LastModifiedBy
			req.body.CreatedDateTime = req.body.LastModifiedDateTime

			// find properties that have a value
			const changes = []
			Object.keys(req.body).forEach(k => {
				if (req.body[k] != null)
					changes.push(k)
			})

			let query = `INSERT INTO PrintDesign (${changes.join()}) VALUES(${changes.map(c => `@${c}`).join()}) `
			let statement = db.prepare(query)
			let info = statement.run(req.body)
			req.body.PrintDesignId = info.lastInsertRowid

			query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
			statement = db.prepare(query)
			info = statement.run("PrintDesign", req.body.PrintDesignId, "INS", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
			const auditLogId = info.lastInsertRowid

			query = "INSERT INTO AuditLogEntry VALUES(null, ?, ?, ?, ?)"
			statement = db.prepare(query)
			changes.forEach(c => {
				if (!auditColumns.includes(c))
					statement.run(auditLogId, c, null, req.body[c])
			})

		} //~ end insert
		else {
			//update
			let printdesign = db.prepare("SELECT * FROM PrintDesign WHERE PrintDesignId=?").get(req.body.PrintDesignId)

			// find properties that have changed
			const changes = []
			Object.keys(req.body).forEach(k => {
				if (printdesign[k] != req.body[k])
					changes.push(k)
			})

			// LastModifiedDateTime has always changed, so only continue if there are more changes than 1
			if (changes.length > 1) { 
				let query = `UPDATE PrintDesign SET ${changes.map(c => `${c}=@${c}`).join(", ")} WHERE PrintDesignId=@PrintDesignId `
				let statement = db.prepare(query)
				statement.run(req.body)

				query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
				statement = db.prepare(query)
				const info = statement.run("PrintDesign", printdesign.PrintDesignId, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
				const auditLogId = info.lastInsertRowid

				query = "INSERT INTO AuditLogEntry VALUES(null, ?, ?, ?, ?)"
				statement = db.prepare(query)
				changes.forEach(c => {
					if (!auditColumns.includes(c))
						statement.run(auditLogId, c, printdesign[c], req.body[c])
				})

			} // end changes

		} // end update

		db.prepare("COMMIT").run()

		// fetch the updated print design to return
		let printdesign = db.prepare("SELECT * FROM PrintDesign WHERE PrintDesignId=?").get(req.body.PrintDesignId)
		res.render ("printdesign_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Print Design`,
			printdesign,
			success: "We have saved your changes",
			errors: [],
			user: req.auth.user,
			poweruser: res.locals.poweruser,
		})

	}
	catch(err) {
		console.log(err)
		res.render ("printdesign_edit.ejs", {
			title: `${req.query.id == 0 ? "New" : "Edit"} Print Design`,
			printdesign: req.body,
			errors: [err.message],
			success: false,
			user: req.auth.user,
			poweruser: res.locals.poweruser,
		})
	}
	finally {
		db.close()
	}
})



// POST data for datatables for deleted PrintDesigns
router.post("/deleted/dt", function(req, res) {
	const db = getDB();

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

	const db = getDB();

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
	const db = getDB();

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

	const db = getDB();

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

	const db = getDB();

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
	const db = getDB();

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

	const db = getDB();
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