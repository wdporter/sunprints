const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");
const { handler, validate } = require("../config/misc.js")
const ScreenController = require( "../controllers/screenController.js");


/* GET Screens page. */
router.get("/", function (req, res) {
	res.render("screen.ejs", { 
		title: "Screens",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	 })
})


// GET screens for the New Order page
router.get("/ordersearch", function (req, res) {
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
					whereClause +=  /*sql*/` Name || Number || Colour LIKE '%${phrase}%'  AND`  
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

router.post("/", ScreenController.screenValidation, validate, handler(ScreenController.createScreen ))


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
router.put("/:id", ScreenController.screenValidation, validate, handler(ScreenController.editScreen)) 


// PUT undelete by setting deleted to 0
router.put("/undelete/:id", (req, res) => {

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
router.delete("/:id", handler(ScreenController.deleteScreen)) 



module.exports = router