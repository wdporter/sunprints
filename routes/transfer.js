const express = require("express")
const router = express.Router()
const Database = require("better-sqlite3")
const sz = require("../sizes.js")

/* GET Basic transfer design page. */
router.get("/", function (req, res, next) {
	res.render("transfer.ejs", { 
		title: "Transfer Designs",
		user: req.auth.user,
		locations: JSON.stringify(sz.locations),
		poweruser: res.locals.poweruser
	 })
})

// GET  get rows from TransferDesign in DataTables format
router.get("/dt", function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) AS Count FROM TransferDesign WHERE Deleted=0 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = " WHERE Deleted=0 "
		if (req.query.search.value)
			req.query.search.value = req.query.search.value.trim()
		if (req.query.search.value) {
			whereClause += ` AND (Code LIKE '%${req.query.search.value}%' OR Notes LIKE '%${req.query.search.value}%') `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM TransferDesign ${whereClause} `)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT * FROM TransferDesign ${whereClause}  `

		const columns = ["TransferDesignId", "", "Code", "Notes"]
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
		res.status(400).json({ "error": ex.message })
	}
	finally {
		if (db != null)
			db.close()
	}

})

// GET transfer names for a given TransferDesign Id
router.get("/names/:id", function (req, res, next) {
	let db = null
	try {
		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

		const statement = db.prepare(`SELECT TransferNameTransferDesignId, SizeCategory, Front, Back, Pocket, Sleeve, Name 
		FROM TransferNameTransferDesign 
		LEFT JOIN TransferName ON TransferName.TransferNameId=TransferNameTransferDesign.TransferNameId 
		WHERE TransferDesignId=? 
		AND TransferName.Deleted=0`)

		const names = statement.all(req.params.id)

		res.send(names)

	}
	catch (ex) {
		res.status(400).json({ "error": ex.message })
	}
	finally {
		if (db != null)
			db.close()
	}

})


// GET transfer designs that match a clause on Code or Notes field
router.get("/design/ordersearch", function (req, res, next) {
	let db = null
	try {

		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

		// Note Womens and Adults are the same
		const statement = db.prepare(`SELECT DISTINCT TransferDesign.TransferDesignId, Code, Notes
FROM TransferDesign 
INNER JOIN TransferNameTransferDesign ON TransferDesign.TransferDesignId=TransferNameTransferDesign.TransferDesignId  
WHERE TransferDesign.Deleted=0
AND (Code LIKE '%${req.query.q}%' OR Notes LIKE '%${req.query.q}%') 

ORDER BY Code, Notes `)
// AND SizeCategory = '${req.query.sizes == 'Kids' ? 'Kids' : 'Adults'}'  
// we have taken this out because they decided that any transfer could go on any size product, ignoring size categories
// that means that the query string parameter "sizes" is ignored
// but they might decide to change their minds


		const records = statement.all()
		res.send(records)

	}
	catch (ex) {
		res.status(400).json({ "error": ex.message })
	}
	finally {
		if (db != null)
			db.close()
	}

})


// GET transfer names for a given transfer design and size category
router.get("/name/ordersearch", function (req, res, next) {
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		// note Womens and Adults are the same
		const statement = db.prepare(`SELECT TransferNameTransferDesignId, TransferNameTransferDesign.TransferNameId, Front, Back, Pocket, Sleeve, Name
FROM TransferNameTransferDesign 
INNER JOIN TransferName on TransferName.TransferNameId = TransferNameTransferDesign.TransferNameId 
WHERE TransferDesignId = ${req.query.transferdesignid} 

AND TransferName.Deleted=0 `)
// AND SizeCategory = '${req.query.sizes == 'Kids' ? 'Kids' : 'Adults'}' 
// we have taken this out because they decided that any transfer could go on any size product, ignoring size categories
// that means that the query string parameter "sizes" is ignored
// but they might decide to change their minds

		const records = statement.all()
		res.json(records).end()
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
			db.close()
	}

})


// GET the transfer name page
router.get("/name", function (req, res, next) {
	res.render("transfername.ejs", { 
		title: "Transfer Names",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	 })
})


// GET a list of Transfer Names that match the given text
router.get("/namelist/:text", function (req, res) {
	let db = null
	try {
		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
		const statement = db.prepare(`SELECT * FROM TransferName WHERE Name LIKE ? AND Deleted=0 LIMIT 20`)
		const records = statement.all(`%${req.params.text}%`)
		res.send(records)
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		if (db != null)
			db.close()
	}

})


// GET rows from TransferName in DataTables format
router.get("/name/dt", function (req, res, next) {
	let db = null

	try {
		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) as Count FROM TransferName WHERE Deleted=0 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = " WHERE Deleted=0"
		if (req.query.search.value)
			req.query.search.value = req.query.search.value.trim()
		if (req.query.search.value) {

			whereClause += ` AND Name LIKE '%${req.query.search.value}%' `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM TransferName ${whereClause} `)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT * FROM TransferName ${whereClause}  `

		const columns = ["TransferNameId", "Name"]
		const orderByClause = req.query.order.map(o => ` ${columns[o.column]} COLLATE NOCASE ${o.dir} `)
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`
		const data = db.prepare(query).all()

		data.forEach(d => d.DT_RowId=d.TransferNameId)

		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data
		})

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
	}
	finally {
		if (db != null)
			db.close()
	}

})


// GET, page for deleted transfer designs
router.get("/deleted", function(req, res) {
	res.render("deleted/transfers.ejs", {
		title: "Deleted Transfer Designs",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	})
})


// GET, page for deleted transfer names
router.get("/name/deleted", function(req, res) {
	res.render("deleted/transfernames.ejs", {
		title: "Deleted Transfer Names",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	})
})


// get list of transfer designs, used by fetch on the transfer name page
router.get("/designs/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
	const transferDesigns = db.prepare(`SELECT Code, Notes, SizeCategory, Front, Back, Pocket, Sleeve 
	FROM TransferDesign 
	INNER JOIN TransferNameTransferDesign ON TransferDesign.TransferDesignId = TransferNameTransferDesign.TransferDesignId
	WHERE TransferNameId=?`).all(req.params.id)

	res.json(transferDesigns).end()
	}
	finally {
		db.close()
	}
})



/*************************************************************************** */



// GET data for datatables for deleted transfer designs
router.post("/deleted/dt", function(req, res) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) AS Count FROM TransferDesign WHERE Deleted=1 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = " WHERE Deleted=1 "
		if (req.body["search[value]"]) {
			whereClause += ` AND (Code LIKE '%${req.body["search[value]"]}%' OR Notes LIKE '%${req.body["search[value]"]}%') `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM TransferDesign ${whereClause} `)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT * FROM TransferDesign ${whereClause}  `
		query += ` ORDER BY ${parseInt(req.body["order[0][column]"])+1} COLLATE NOCASE ${req.body["order[0][dir]"]} `
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


// GET data for datatables for deleted transfer names
router.post("/deleted/name/dt", function(req, res) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) AS Count FROM TransferName WHERE Deleted=1 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let whereClause = " WHERE Deleted=1 "
		if (req.body["search[value]"]) {
			whereClause += ` AND Name LIKE '%${req.body["search[value]"]}%'  `
			// get count of filtered records
			statement = db.prepare(`SELECT Count(*) as Count FROM TransferDesign ${whereClause} `)
			recordsFiltered = statement.get().Count
		}

		let query = ` SELECT TransferNameId, Name, LastModifiedBy, LastModifiedDateTime FROM TransferName ${whereClause}  `
		query += ` ORDER BY ${parseInt(req.body["order[0][column]"])+1} COLLATE NOCASE ${req.body["order[0][dir]"]} `
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



// POST create an entry in TransferNameTransferDesign
router.post("/namedesign", function (req, res) {

	if (! (req.body.Front || req.body.Back || req.body.Pocket || req.body.Sleeve)) {
		res.statusMessage = "We require at least one location"
		res.sendStatus(400).end()
		return
	}
	
	
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		const date = new Date().toLocaleString()
		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = date

			db.prepare("BEGIN TRANSACTION").run()

		let query = `INSERT INTO TransferNameTransferDesign (${Object.keys(req.body).join(", ")}) VALUES (${Object.keys(req.body).map(c => `@${c}`).join(", ")})`
		let statement = db.prepare(query)
		let info = statement.run(req.body)
		console.log(info)
		let newId = info.lastInsertRowid

		query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
		statement = db.prepare(query)
		info = statement.run("TransferNameTransferDesign", newId, "INS", req.auth.user, date)
		console.log(info)
		const auditLogId = info.lastInsertRowid

		query = "INSERT INTO AuditLogEntry VALUES(null, ?, ?, null, ?)"
		statement = db.prepare(query)
		for (col in req.body) {
			info = statement.run(auditLogId, col, req.body[col])
			console.log(info)
		}

		res.send(String(newId)).end()
		db.prepare("COMMIT").run()
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		console.log(ex)
		db.prepare("ROLLBACK").run()
	}
	finally {
		db.close()
	}
})


// POST new/create in the TransferDesign table
router.post("/", function (req, res) {

	if (!req.body.Code) {
		res.statusMessage = "We require a code"
		res.sendStatus(400).end()
		return;
	}

	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()
		const cols = []
		for (col in req.body) 
			if (req.body[col])
				cols.push(col)
		
		db.prepare("BEGIN TRANSACTION").run()

		let query = `INSERT INTO TransferDesign ( ${cols.join(", ")} ) VALUES ( ${cols.map(c => ` @${c} `).join(", ")} )`
		let statement = db.prepare(query)
		let info = statement.run(req.body)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("TransferDesign", info.lastInsertRowid, "INS", req.body.CreatedBy, req.body.CreatedDateTime)
		const auditLogId = info.lastInsertRowid
		console.log(info)
		statement = db.prepare("INSERT INTO AuditLogEntry VALUES(null, ?, ?, null, ?)") 
		info = statement.run(auditLogId, "Code", req.body.Code)
		console.log(info)
		if (cols.includes("Notes")) {
			info = statement.run(auditLogId, "Notes", req.body.Notes)
			console.log(info)
		}

		res.send("ok").end()
		db.prepare("COMMIT").run()
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		db.prepare("ROLLBACK").run()
		console.log(ex)
	}
	finally {
		db.close()
	}
})


// POST create a new name
router.post("/name", function(req, res) {
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	const date = new Date().toLocaleString()
	try {
		
		let statement = db.prepare("INSERT INTO TransferName VALUES(null, ?, 0, ?, ?, ?, ?)")

		db.prepare("BEGIN TRANSACTION").run()
		
		let info = statement.run(req.body.name, req.auth.user, date, req.auth.user, date)
		console.log(info)
		res.json({id: info.lastInsertRowid})//todo: test, this was changed

		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("TransferName", info.lastInsertRowid, "INS", req.auth.user, date)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLogEntry VALUES(null, ?, 'Name', null, ?) ")
		info = statement.run(info.lastInsertRowid, req.body.name)

		db.prepare("COMMIT").run()

		
		res.end()

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
		console.log(ex)
	}
	finally {
		if (db != null)
			db.close()
	}

})


/*************************************************************************** */


// PUT edit/update the TransferDesign table
router.put("/:id", function (req, res) {

	if (!req.body.Code) {
		res.statusMessage = "We require a code"
		res.sendStatus(400).end()
		return;
	}

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		// get the existing item so we can find out what changed
		let query = "SELECT * FROM TransferDesign WHERE TransferDesignId=?"
		let statement = db.prepare(query)
		const myTransferDesign = statement.get(req.params.id)

		// get a list of what changed
		const date = new Date().toLocaleString()
		const cols = []
		for (col in req.body) {
			req.body = req.body || null
			if (myTransferDesign[col] != req.body[col])
				cols.push(col)
		}
		if (cols.length == 0) {
			res.statusMessage = "We couldn't find any changes"
			res.sendStatus(400).end()
			return;
		}

		// set the values we need to pass to prepared statement
		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = date
		req.body.TransferDesignId = req.params.id
		
		db.prepare("BEGIN TRANSACTION").run()

		query = `UPDATE TransferDesign SET ${cols.map(c => ` ${c}=@${c} `)} 
		, LastModifiedDateTime=@LastModifiedDateTime, LastModifiedBy=@LastModifiedBy
		WHERE TransferDesignId=@TransferDesignId `
		statement = db.prepare(query)
		let info = statement.run(req.body)
		console.log(info)

		query = `INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?) `
		statement = db.prepare(query)
		info = statement.run("TransferDesign", req.params.id, "UPD", req.auth.user, date)
		console.log(info)
		const auditLogId = info.lastInsertRowid

		for (col of cols) {
			query = `INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?) `
			statement = db.prepare(query)
			info = statement.run(auditLogId, col, myTransferDesign[col], req.body[col])
			console.log(info)
		}

		res.send("ok").end()

		db.prepare("COMMIT").run()

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		db.prepare("ROLLBACK").run()

	}
	finally {
		db.close()
	}
})


// PUT update a transfer name
router.put("/name/:id", function(req, res) {
	
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	const date = new Date().toLocaleString()

	try {
		

		let statement = db.prepare(`UPDATE TransferName 
		SET Name=?, LastModifiedBy=?, LastModifiedDateTime=? 
		WHERE TransferNameId=?`)

		db.prepare ("BEGIN TRANSACTION").run()

		let info = statement.run(req.body.newName, req.auth.user, date, req.params.id)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("TransferName", req.params.id, "INS", req.auth.user, date)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
		info = statement.run(info.lastInsertRowid, "Name", req.body.oldName, req.body.newName)

		db.prepare("COMMIT").run()

		console.log(info)

		res.send("ok")

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		console.log(ex)
	}
	finally {
		if (db != null)
			db.close()
	}

})


// PUT restore a deleted transfer design
router.put("/restore/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		const date = new Date().toLocaleString()
		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare("UPDATE TransferDesign SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE TransferDesignId=?")
		let info = statement.run(req.auth.user, date, req.params.id)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("TransferDesign", req.params.id, "UPD", req.auth.user, date)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES (?, ?, ?, ?)")
		info = statement.run(info.lastInsertRowid, "Deleted", 1, 0)
		console.log(info)

		db.prepare("COMMIT").run()

		res.send("ok").end()
	
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


// PUT restore a deleted transfer name
router.put("/restore/name/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		const date = new Date().toLocaleString()
		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare("UPDATE TransferName SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE TransferNameId=?")
		let info = statement.run(req.auth.user, date, req.params.id)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("TransferName", req.params.id, "UPD", req.auth.user, date)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES (?, ?, ?, ?)")
		info = statement.run(info.lastInsertRowid, "Deleted", 1, 0)
		console.log(info)

		db.prepare("COMMIT").run()

		res.send("ok").end()
	
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


// DELETE an entry from TransferNameTransferDesign for the id of a TransferNameTransferDesign row
router.delete("/name/:id", function (req, res, next) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		db.prepare("BEGIN TRANSACTION").run()
		const date = new Date().toLocaleString()

		const nameDesign = db.prepare("SELECT TransferDesignId, TransferNameId, SizeCategory, Front, Back, Pocket, Sleeve FROM TransferNameTransferDesign WHERE TransferNameTransferDesignId=?").get(req.params.id)

		let query = "DELETE FROM TransferNameTransferDesign WHERE TransferNameTransferDesignId=?"
		let statement = db.prepare(query)
		let info = statement.run(req.params.id)
		console.log(info)

		query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
		statement = db.prepare(query)
		info = statement.run("TransferNameTransferDesign", req.params.id, "DEL", req.auth.user, date)
		console.log(info)
		const auditLogId = info.lastInsertRowid

		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, null)")
		for (col in nameDesign) {
			info = statement.run(auditLogId, col, nameDesign[col])
			console.log(info)
		}

		db.prepare("COMMIT").run()

		res.send("success").end()

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
		console.log(`error: transfer.js delete("/name/:id") ${ex}`)
	}
	finally {
		db.close()
	}

})


// DELETE an entry from TransferName
router.delete("/transfername/:id", (req, res) => {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	const date = new Date().toLocaleString()

	try {
		let statement = db.prepare("UPDATE TransferName SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE TransferNameId=?")
		db.prepare("BEGIN TRANSACTION").run()
		let info = statement.run(req.auth.user, date, req.params.id)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)")
		info = statement.run("TransferName", req.params.id, "DEL", req.auth.user, date)
		console.log(info)
		
		db.prepare("COMMIT").run()

		res.send("deleted").end()

		console.log(info)

	}
	catch(ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.sendStatus(400).end()
	}
	finally {
		db.close()
	}


})


// DELETE from the TransferDesign table (and all matching items in TransferNameTransferDesign)
router.delete("/design/:id", function (req, res) {
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		let info = null
		const date = new Date().toLocaleString()
		db.prepare("BEGIN TRANSACTION").run()

		// first get a list of related names so we can log they were soft-deleted
		let query = "SELECT * FROM TransferNameTransferDesign WHERE TransferDesignId=?"
		let statement = db.prepare(query)
		const myTransferNameTransferDesigns = statement.all(req.params.id)

		for(tntd of myTransferNameTransferDesigns) {

			query = "UPDATE TransferNameTransferDesign SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE TransferNameTransferDesignId=?"
			statement = db.prepare(query)
			info = statement.run(req.auth.user, date, tntd.TransferNameTransferDesignId)
			console.log(info)

			query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
			statement = db.prepare(query)
			info = statement.run("TransferNameTransferDesign", tntd.TransferNameTransferDesignId, "DEL", req.auth.user, date)
			console.log(info)
			// no audit log entry

		}

		query = "UPDATE TransferDesign SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE TransferDesignId=? "
		statement = db.prepare(query)
		info = statement.run(req.auth.user, date, req.params.id)

		query = "INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)"
		statement = db.prepare(query)
		info = statement.run("TransferDesign", req.params.id, "DEL", req.auth.user, date)
		console.log(info)
		// no audit log entry

		res.send("Success").end()

		db.prepare("COMMIT").run()


	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		db.prepare("ROLLBACK").run()
		console.log(ex)
	}
	finally {
			db.close()
	}


})


module.exports = router