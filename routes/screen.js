const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");
const {convertToIsoDate} = require("../config/date.js")

/* GET Screens page. */
router.get("/", function (req, res, next) {
	res.render("screen.ejs", { 
		title: "Screens",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	 })
})

/* GET Screens page. 
expermimental */
router.get("/2", function (req, res, next) {
	res.render("screen3.ejs", { 
		title: "Screens",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	 })
})

// GET screens for the New Order page
router.get("/ordersearch", function (req, res, next) {
	const db = getDB();
	try {

		//note Womens and Adults are the same, ie Adult screens are for womens garments also
		const statement = db.prepare(`SELECT ScreenPrintDesignId, Screen.ScreenId, Front, Back, Pocket, Sleeve, Number, Colour, Screen.Name 
FROM ScreenPrintDesign 
INNER JOIN Screen on Screen.ScreenId = ScreenPrintDesign.ScreenId 
WHERE PrintDesignId = ${req.query.printdesignid} 
AND Screen.Deleted = 0
ORDER BY Name COLLATE NOCASE, Number COLLATE NOCASE, Colour COLLATE NOCASE`)
// --AND SizeCategory = '${req.query.sizes == 'Kids' ? 'Kids' : 'Adults'}' 
// we have taken this out because they decided that any screen could go on any size product, ignoring size categories
// that means that the query string parameter "sizes" is ignored
// but they might decide to change their minds

		const records = statement.all()
		res.send(records)
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


/* get screens, filtered by term, used on Print Design page */
router.get("/filter/:term", function(request, response) {

	const db = getDB();
	try {
		const term = `%${request.params.term}%`
		
		const statement = db.prepare(`SELECT * FROM Screen WHERE Deleted=0 AND (Number LIKE @term OR Colour LIKE @term OR Name LIKE @term)`)
		const screens = statement.all({term})

		const retVal = {
			count: screens.length,
			items: screens.slice(0, 100)
		}

		response.send(retVal).end()

	}
	catch(ex) {
		response.statusMessage = ex.message
		response.status(400).end
	}
	finally {
			db.close()
	}


})



/* get screens for data tables server side processing */
router.get("/dt", function(req, res) {

	const db = getDB();

	try {

		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) as Count FROM Screen WHERE Deleted=0 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let query = `SELECT Screen.ScreenId, Name, Number, Colour, s.maxdate AS LastUsed FROM Screen
		LEFT OUTER JOIN 
		(SELECT Sales.FrontScreenId AS ScreenId, MAX(SalesTotal.OrderDate, 0) AS maxdate
		FROM Sales
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
		GROUP BY Sales.FrontScreenId
		UNION ALL 
		SELECT Sales.FrontScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
		FROM Sales
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
		GROUP BY Sales.FrontScreenId
		UNION ALL 
		SELECT Sales.BackScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
		FROM Sales
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
		GROUP BY Sales.BackScreenId
		UNION ALL 
		SELECT Sales.BackScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
		FROM Sales
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
		GROUP BY Sales.BackScreen2Id
		UNION ALL 
		SELECT Sales.PocketScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
		FROM Sales
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
		GROUP BY Sales.PocketScreenId
		UNION ALL 
		SELECT Sales.PocketScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
		FROM Sales
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
		GROUP BY Sales.PocketScreen2Id
		UNION ALL 
		SELECT Sales.SleeveScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
		FROM Sales
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
		GROUP BY Sales.SleeveScreenId
		UNION ALL 
		SELECT Sales.SleeveScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
		FROM Sales
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
		GROUP BY Sales.SleeveScreen2Id
		) s
		ON  s.ScreenId=Screen.ScreenId `
		let	whereClause = " WHERE Deleted=0 "

		let whereParams = []
		if (req.query.search.value) {
			req.query.search.value = req.query.search.value.trim()
			
			const searchables = req.query.columns.filter(c => c.searchable == "true")
			const cols = searchables.map(c => `${c.data} LIKE ?`).join(" OR ")
			whereParams = searchables.map(c => `%${req.query.search.value}%`)
			whereClause += ` AND ( ${cols} ) `

			statement = db.prepare(`SELECT Count(*) as Count FROM Screen ${whereClause}`)
			recordsFiltered = statement.get(whereParams).Count
		}

		query += whereClause

		query += ` ORDER BY ${req.query.order[0].column } COLLATE NOCASE ${req.query.order[0].dir} `

		query += ` LIMIT ${req.query.length} OFFSET ${req.query.start} `
		const data = db.prepare(query).all(whereParams)

		data.forEach(d => d.DT_RowId=d.ScreenId)

		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data
		}).end()

	}
	catch(ex) {
		res.statusMessage = ex.message
		res.status(400).end()
		console.log(ex)
	}
	finally {
		db.close()
	}

})



/* get screens for data tables server side processing */
router.get("/dt2", function(req, res) {

	const db = getDB();

	try {
		
		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) as Count FROM Screen WHERE Deleted=0 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		let query = "SELECT Name, Number, Colour, ScreenId FROM Screen "
		let	whereClause = " WHERE Deleted=0 "
		// if (req.query.search.value)
		// 	req.query.search.value = req.query.search.value.trim()
		// if (req.query.search.value) {
		// 	whereClause += ` AND (Number LIKE '%${req.query.search.value}%' 
		// 	OR Colour LIKE '%${req.query.search.value}%' 
		// 	OR Name LIKE '%${req.query.search.value}%') `
		// 	// get count of filtered records
		recordsFiltered = db.prepare(`SELECT Count(*) as Count FROM Screen ${whereClause}`).get().Count
//		}

		query += whereClause

		query += ` ORDER BY ${ req.query.order[0].column } COLLATE NOCASE ${req.query.order[0].dir} `

		query += ` LIMIT ${req.query.length} OFFSET ${req.query.start} `
		const data = db.prepare(query).all()

		//data.forEach(d => d.DT_RowId=d.ScreenId)

		res.send({
			draw: parseInt(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data
		}).end()

	}
	catch(ex) {
		res.statusMessage = ex.message
		res.status(400).end()
		console.log(ex)
	}
	finally {
		db.close()
	}

})









// GET page of deleted screens
router.get("/deleted", (req, res) => {

	const db = getDB();

	const deleted = db.prepare(/*sql*/`SELECT * FROM Screen WHERE DELETED=1 ORDER BY LastModifiedDateTime DESC`).all()
	
	

	res.render("deleted/screens.ejs", {
		title: "Deleted Screens",
		user: req.auth.user,
		deleted,
		poweruser: res.locals.poweruser
	})

})


// GET details of a screen
router.get("/:id", (req, res) => {

	const db = getDB();
	try {
		const query = `SELECT * FROM Screen WHERE ScreenId=?`
		const statement = db.prepare(query)
		const screen = statement.get(req.params.id)
		res.json(screen).end()
	}
	catch(ex) {
		response.statusMessage = ex.message
		response.status(400).end
	}
	finally {
		db.close()
	}
})


// get list of print designs, used by fetch on the screens page
router.get("/prints/:id", (req, res) => {

	const db = getDB();
	try {
		const printDesigns = db.prepare(/*sql*/`
			SELECT Code, Notes, Comments, SizeCategory, Front, Back, Pocket, Sleeve 
			FROM PrintDesign 
			INNER JOIN ScreenPrintDesign ON PrintDesign.PrintDesignId = ScreenPrintDesign.PrintDesignId
			WHERE ScreenId=?`).all(req.params.id)

		res.json(printDesigns).end()
	}
	finally {
		db.close()
	}
})


/*************************************************************************** */

/// POST to create a new screen
router.post("/", function(req, res) {
	
	const db = getDB();

	try {

		let statement = db.prepare(`SELECT COUNT(*) AS Count FROM Screen WHERE Number=? AND Colour=? AND Name=?`)

		// it's ok to save duplicates
		// let count = statement.get(req.body.Number, req.body.Colour, req.body.Name).Count
		// if (count > 0) {
		// 	res.statusMessage = `We already have a Screen with these details.`
		// 	res.status(400).end()
		// 	return
		// }

		// name must be saved as a null, so we know it is standard screen
		if (req.body.Name == "")
			req.body.Name = null

		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()

		const columns = []
		for (const column in req.body) {
			if (req.body[column]) { // value is truthy
				columns.push(column)
			}
		}

		const query = `INSERT INTO Screen ( ${columns.join(", ")} ) VALUES ( ${columns.map(c => ` @${c} `).join(", ")} )`
		statement = db.prepare(query)

		let info = statement.run(req.body)

		res.json({
			message: "success",
			id: info.lastInsertRowid
		}).end()

		console.log(info)

		// now insert into Audit Log
		try {
			db.prepare("BEGIN TRANSACTION").run()

			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Screen", info.lastInsertRowid, "INS", req.body.CreatedBy, req.body.CreatedDateTime)
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
		catch (err) {
			db.prepare("ROLLBACK").run()
			console.log(err.message)
			// we ignore the error, if it went into the other catch block, .end() would be called twice, we can't have that
		}


	}
	catch(ex) {
		console.log(ex)
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}
})


// GET data for datatables for deleted Screens
router.post("/deleted/dt", function(req, res) {
	const db = getDB();

	try {
		
		// first get count of all records
		let statement = db.prepare("SELECT COUNT(*) AS Count FROM Screen WHERE Deleted=1 ")
		const recordsTotal = statement.get().Count
		let recordsFiltered = recordsTotal

		// the LastModifiedDateTime column is not sortable by sqlite, so we have to do it here
		let data;
		if (req.body["order[0][column]"] == "5") {
			data = db.prepare(/*sql*/`SELECT ScreenId, Number, Colour, Name, LastModifiedBy, LastModifiedDateTime FROM Screen WHERE Deleted=1`).all()
			data.forEach(d => {
				d.LastModifiedDateTime = convertToIsoDate(d.LastModifiedDateTime)
			})
			data.sort((a, b) => {
				return req.body["order[0][dir]"] == "asc" 
					? Date.parse(a.LastModifiedDateTime) - Date.parse(b.LastModifiedDateTime)
					: Date.parse(b.LastModifiedDateTime) - Date.parse(a.LastModifiedDateTime)
			})

			const start = parseInt(req.body.start)
			const length = parseInt(req.body.length)
			data = data.slice(start, start + length)

			// put back the format
			data.forEach(d=> {
				const parse = Date.parse(d.LastModifiedDateTime)
				const newDate = new Date(parse)
				const formatted = newDate.toLocaleDateString(undefined, {day: "numeric", month: "numeric", year: "numeric", hour: "numeric", minute: "numeric", second: "numeric", hour12: true}) 
				d.LastModifiedDateTime = formatted
			})

		}
		else {
			let whereClause = " WHERE Deleted=1 "
			if (req.body["search[value]"]) {
				whereClause += ` AND (Number LIKE '%${req.body["search[value]"]}%' OR Colour LIKE '%${req.body["search[value]"]}%'
					OR Name LIKE '%${req.body["search[value]"]}%' 
				) `
				// get count of filtered records
				statement = db.prepare(`SELECT Count(*) as Count FROM Screen ${whereClause} `)
				recordsFiltered = statement.get().Count
			}

			let query = ` SELECT ScreenId, Number, Colour, Name, LastModifiedBy, LastModifiedDateTime FROM Screen ${whereClause}  `
			query += ` ORDER BY ${parseInt(req.body["order[0][column]"]) + 1} COLLATE NOCASE ${req.body["order[0][dir]"]} `
			query += ` LIMIT ${req.body.length} OFFSET ${req.body.start}`
			const data = db.prepare(query).all()
		}

		res.send({
			draw: Number(req.body.draw),
			recordsTotal,
			recordsFiltered,
			data
		})
	}
	catch(ex) {
		console.log("❌" + ex.message)
	}
	finally {
		db.close()
	}
})


// POST get screens in vue data table format
router.post("/vt", (req, res) => {

	const db = getDB();

	try {

		let query = "SELECT COUNT(*) AS Count FROM Screen WHERE DELETED = 0"
		let search = ""
		if (req.body.searchValue.trim()) {
			search = `%${decodeURIComponent(req.body.searchValue.trim())}%`
			query += ` AND ( Number LIKE @search OR Colour LIKE @search OR Name LIKE @search ) `
		}
		const count = db.prepare(query).get({search}).Count
	

	query = `SELECT Screen.ScreenId, Number, Colour, Name `
//	s.maxdate AS LastUsed 
	query += '	FROM Screen '
	// LEFT OUTER JOIN 
	// (SELECT Sales.FrontScreenId AS ScreenId, MAX(SalesTotal.OrderDate, 0) AS maxdate
	// FROM Sales
	// INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
	// GROUP BY Sales.FrontScreenId
	// UNION ALL 
	// SELECT Sales.FrontScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
	// FROM Sales
	// INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
	// GROUP BY Sales.FrontScreenId
	// UNION ALL 
	// SELECT Sales.BackScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
	// FROM Sales
	// INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
	// GROUP BY Sales.BackScreenId
	// UNION ALL 
	// SELECT Sales.BackScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
	// FROM Sales
	// INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
	// GROUP BY Sales.BackScreen2Id
	// UNION ALL 
	// SELECT Sales.PocketScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
	// FROM Sales
	// INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
	// GROUP BY Sales.PocketScreenId
	// UNION ALL 
	// SELECT Sales.PocketScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
	// FROM Sales
	// INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
	// GROUP BY Sales.PocketScreen2Id
	// UNION ALL 
	// SELECT Sales.SleeveScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
	// FROM Sales
	// INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
	// GROUP BY Sales.SleeveScreenId
	// UNION ALL 
	// SELECT Sales.SleeveScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
	// FROM Sales
	// INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId	
	// GROUP BY Sales.SleeveScreen2Id
	// ) s
	// ON  s.ScreenId=Screen.ScreenId 
	query += " WHERE Deleted=0  "

	if (search) {
		query += ` AND ( Number LIKE @search OR Colour LIKE @search OR Name LIKE @search ) `
	}


	query += `ORDER BY ${req.body.sortBy} COLLATE NOCASE ${req.body.sortType}`
	query += ` LIMIT ${req.body.rowsPerPage} OFFSET ${req.body.rowsPerPage * (req.body.page-1)} `
	const data = db.prepare(query).all({search})

	res.send({
		data,
		count
	}).end()

	}
	catch(ex) {
		console.log(ex)
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}

})







/*************************************************************************** */


// PUT to edit an existing screen
router.put("/:id", function(req, res) {
	
	const db = getDB();

	req.body.ScreenId = req.params.id
	delete req.body.LastUsed

	if (req.body.Name == "")
		req.body.Name = null

	try {
		req.body.LastModifiedDateTime = new Date().toLocaleString()
		req.body.LastModifiedBy = req.auth.user
		
		let statement = db.prepare(`SELECT COUNT(*) AS Count FROM Screen WHERE Number=?`)
		let count = statement.get(req.body.Number)
		if (count > 1) {
			res.statusMessage = `We are already using that Screen Number ${req.body.Number}.`
			res.status(400).end()
			return
		}

		const myScreen = db.prepare("SELECT * FROM Screen WHERE ScreenId=?").get(req.params.id)
		const columns = []
		for (const column in req.body) {
			if (req.body[column] != myScreen[column]) {
				columns.push(column)
			}
		}

		const query = `UPDATE Screen SET 
		${columns.map(col => `${col}=@${col}`).join(", ")}	
		WHERE ScreenId = @ScreenId `
		statement = db.prepare(query)

		let info = statement.run(req.body)
		
		res.json({
			message: "success"
		}).end()
		console.log(info)

		// now add it to audit logs
		try {
			db.prepare("BEGIN TRANSACTION").run()
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Screen", req.params.id, "UPD", req.auth.user, req.body.LastModifiedDateTime)


			// now add it to audit log entry
			for (let col of columns) {
				if (col.startsWith("LastM"))
					continue
				statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
				statement.run(info.lastInsertRowid, col, myScreen[col], req.body[col])
			}

			db.prepare("COMMIT").run()
		}
		catch (ex) {
			db.prepare("ROLLBACK").run()
			// do nothing, because the response has already ended. 
			// if we threw the error, then it would be caught and the .end() would have been called twice
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


// PUT edit by setting deleted to 0
router.put("/restore/:id", (req, res) => {

	const db = getDB();

	try {
		const date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE Screen SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE ScreenId=?")
		let info = statement.run(req.auth.user, date, req.params.id)
		res.send("ok").end()
		console.log(info)

		try {
			db.prepare("BEGIN TRANSACTION").run()

			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Screen", req.params.id, "UPD", req.auth.user, date)
			console.log(info)

			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES (?, ?, ?, ?)")
			info = statement.run(info.lastInsertRowid, "Deleted", 1, 0)
			console.log(info)

			db.prepare("COMMIT").run()
		}
		catch (ex) {
			db.prepare("ROLLBACK").run()
			console.log(ex)
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


// PUT to edit an existing screen
router.delete("/:id", function(req, res) {
	
	const db = getDB();

	try {
		let date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE Screen SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE ScreenId=?")
		let info = statement.run(req.auth.user, date, req.params.id)

		res.json({
			message: "success"
		}).end()
		console.log(info)

		try {
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Screen", req.params.id, "DEL", req.auth.user, date)
			console.log(info)
			// no AuditLogEntry, assumed as OldValue=0 NewValue=1
		}
		catch (ex) {
			// ignore
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