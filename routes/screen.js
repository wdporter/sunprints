const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");


/* GET Screens page. */
router.get("/", function (req, res, next) {
	res.render("screen.ejs", { 
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


/* get screens for vue-easy-datatable server side processing */
router.get("/edt", function(req, res) {
	const db = getDB()
	try {

		let	whereClause = " WHERE  Deleted=0 "
		//  filtering to enhance where clause
		if (req.query.searchValue != "undefined") {
			const searchPhrases = req.query.searchValue.split(" ").filter(e => e)
			if (searchPhrases.length > 0) {
				whereClause += " AND "
				for (const phrase of searchPhrases) {
					whereClause +=  /*sql*/` Name || ' ' || Number || ' ' || Colour LIKE '%${phrase}%'  AND`  
				}
				whereClause = whereClause.substring(0, whereClause.length-3) // get rid of trailing "AND" 
			}
		}

		// get a count of all records
		let statement = db.prepare(/*sql*/`SELECT COUNT(*) as Count FROM ScreenSearch_View ${whereClause} `)
		const serverTotalItemsLength = statement.get().Count

		// todo, add last used date
		let query = /*sql*/`SELECT Name, Number, Colour, ScreenId, LastUsed FROM ScreenSearch_View ${whereClause}`

		// create order by clause
		orderByClause = /*sql*/` ORDER BY ${req.query.sortBy}  COLLATE NOCASE ${req.query.sorttype}`
		query += orderByClause

		// create limit cause
		query += /*sql*/` LIMIT ${req.query.rowsperpage}`

		// create offset clause
		query += /*sql*/` OFFSET  ${Number(req.query.page - 1) * Number(req.query.rowsperpage) }`
		
		const data = db.prepare(query).all()

		res.send({
			serverTotalItemsLength,
			serverCurrentPageItems: data
		})
	}
	catch(ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(ex)
	}
	finally
	{
		db.close()
	}
})

// GET page of deleted screens
router.get("/deleted", (req, res) => {

	const db = getDB();

	const deleted = db.prepare("SELECT * FROM Screen WHERE DELETED=1 ORDER BY LastModifiedDateTime DESC").all()

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
			SELECT Code, Notes, Comments, REPLACE(SizeCategory, ',', ', ') AS SizeCategory, Front, Back, Pocket, Sleeve 
			FROM PrintDesign 
			INNER JOIN ScreenPrintDesign ON PrintDesign.PrintDesignId = ScreenPrintDesign.PrintDesignId
			WHERE ScreenId=?`).all(req.params.id)

		res.json(printDesigns)
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

		const query = /*sql*/`INSERT INTO Screen ( ${columns.join(", ")} ) VALUES ( ${columns.map(c => ` @${c} `).join(", ")} )`
		const statement = db.prepare(query)
		const info = statement.run(req.body)
		console.log(info)

		req.body.ScreenId = info.lastInsertRowid
		res.location(`/screen/${info.lastInsertRowid}`)
		res.status(201)
		res.json({
   			success: true,
    		message: "saved ok",
    		data: req.body,
    		timestamp: new Date().toISOString()
  		})

		// code to insert into Audit Log was here
	}
	catch(ex) {
		console.log(ex)
		res.status(400).json({
   			success: false,
    		message: ex.message,
    		data: null,
    		timestamp: new Date().toISOString()
  		})
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


// PUT to edit an existing screen
router.put("/:id", function(req, res) {
	
	const db = getDB();

	try {
		delete req.body.LastUsed

		// name must be saved as a null, so we know it is standard screen
		if (req.body.Name == "")
			req.body.Name = null


		req.body.LastModifiedDateTime = new Date().toLocaleString()
		req.body.LastModifiedBy = req.auth.user
		
		// find changed values
		const myScreen = db.prepare(/*sql*/`SELECT * FROM Screen WHERE ScreenId=?`).get(req.params.id)
		const columns = []
		for (const column in req.body) {
			if (req.body[column] != myScreen[column]) {
				columns.push(column)
			}
		}

		const query = /*sql*/`UPDATE Screen SET 
		${columns.map(col => `${col}=@${col}`).join(", ")}	
		WHERE ScreenId = @ScreenId `
		statement = db.prepare(query)

		let info = statement.run(req.body)
		console.log(info)
		
		res.sendStatus(204)

		// deleted some code here to write change to audit logs
	}
	catch(ex) {
		res.statusMessage = ex.message
		res.status(400).json({
   			success: false,
    		message: ex.message,
    		data: null,
    		timestamp: new Date().toISOString()
  		})
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


/*************************************************************************** */


// DELETE deletes an existing screen
router.delete("/:id", function(req, res) {
	
	const db = getDB();

	try {
		let date = new Date().toLocaleString()
		let statement = db.prepare(/*sql*/`UPDATE Screen SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE ScreenId=?`)
		let info = statement.run(req.auth.user, date, req.params.id)
		console.log(info)

		res.sendStatus(204)
	}
	catch(ex) {
		res.statusMessage = ex.message
		res.status(400).json({
   			success: false,
    		message: ex.message,
    		data: null,
    		timestamp: new Date().toISOString()
  		})
	}
	finally {
		db.close()
	}

})



module.exports = router