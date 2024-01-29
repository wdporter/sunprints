const express = require("express")
const router = express.Router()
const sz = require("../config/sizes.js");
const productService = require("../service/productService.js");
const { json } = require("body-parser");
const getDB = require ("../integration/dbFactory.js")

// GET the garments page
router.get("/", function (req, res, next) {
	res.render("garment.ejs", {
		title: "Products",
		user: req.auth.user,
		sizes: JSON.stringify(sz.sizes),
		poweruser: res.locals.poweruser,
		stylesheets: ["/stylesheets/product-theme.css"]
	})
})


// GET the warning list for garments
router.get("/warninglist", function (req, res, next) {
	const db = getDB();
	try {

		const statement = db.prepare(`SELECT Garment.*, ${sz.allSizes.map(sz => `sum(StockOrderGarment.${sz}) AS sog${sz}`).join(",")} FROM Garment 
		LEFT JOIN StockOrderGarment ON StockOrderGarment.GarmentId=Garment.GarmentId
		GROUP BY Garment.GarmentId
		HAVING Deleted=0
		ORDER BY Garment.GarmentId`)

		const results = statement.all()

		const garments = {}

		// save the ones that have a size value that is less that min value for every relevant size
		results.forEach(g => {
			if (!garments[g]) {
				let found = false
				for (let size of sz.sizes[g.SizeCategory]) {
					if (g[size] < g[`Min${size}`]) {
						found = true // if one is to be displayed, display all
						break;
					}
				}
				if (found) { // if one is to be displayed, display all
					// initialise on order values
					sz.sizes[g.SizeCategory].forEach(sz => g[`OnOrder${sz}`] = 0 + g[`sog${sz}`])
					garments[g.GarmentId] = g
				}
			}
			else {
				// we already have it in our list, so we must be looking at a result from Stock Order Garment
				// so find any values we have on order and add it to the garment
				sz.sizes[g.SizeCategory].forEach(size => {
					if (g[`sog${size}`] > 0)
						g[`OnOrder${size}`] += g[`sog${size}`]
				})
			}
		})

		// we have retrieved balances for all sizes, remove sizes where the balance is ok
		// for (let g in garments) {
		// 	for (let size of sz.sizes[garments[g].SizeCategory]) {
		// 			if (garments[g][size] >= garments[g][`Min${size}`]) {
		// 				delete garments[g][size]
		// 				delete garments[g][`Min${size}`]
		// 			}
		// 		}
		// 	}

		const returnGarments = []
		for (g in garments)
			returnGarments.push(garments[g])
		
			returnGarments.sort(function(a, b) {
				if (a.Type > b.Type)
					return 1
				else if (a.Type < b.Type)
					return -1
				else {
					if (a.Code > b.Code)
						return 1
					else if (a.Code < b.Code)
						return -1
					else {
						if (a.Colour > b.Colour)
							return 1
						else if (a.Colour < b.Colour)
							return -1
					}
				}
			})

		res.render("warninglist.ejs", {
			title: "Garment Warning List",
			user: req.auth.user,
			garments: returnGarments,
			sizes: sz.sizes
		})


	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}

})


// GET a list of garments used by the garment datatable in the purchase page
router.get("/purchase/dt", function (req, res) {

	const db = getDB();

	try {

		const recordsTotal = db.prepare(`SELECT Count(*) AS count FROM Garment `).get().count
		let recordsFiltered = recordsTotal

		let query = `SELECT * FROM Garment `
		const searchClauses = ["Deleted = 0"]
		req.query.columns.forEach(c => {
			if (c.search.value) {
				searchClauses.push(` ${c.data} LIKE '%${c.search.value}%' `)
			}
		})
		if (searchClauses.length > 0) {
			let whereClause = " WHERE "
			whereClause += searchClauses.join(" AND ")
			recordsFiltered = db.prepare(`SELECT Count(*) as count FROM Garment ${whereClause}`).get().count
			query += whereClause
		}

		const columns = ["SizeCategory", "Code", "Type", "Colour", "Label", "GarmentId"] // sort columns 
		const orderByClause = req.query.order.map(o => ` ${columns[o.column]} COLLATE NOCASE ${o.dir} `)
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`
		const garments = db.prepare(query).all()


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data: garments.map(g => {
				g.DT_RowId = `row-${g.GarmentId}`
				return g
			})
		})
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


// GET a list of garments used by the garment datatable in the new order page
router.get("/ordersearch", function (req, res, next) {
	let db = null
	try {

		const db = getDB();


		const recordsTotal = db.prepare(`SELECT Count(*) AS count FROM Garment WHERE Deleted=0 `).get().count
		let recordsFiltered = recordsTotal

		let query = `SELECT GarmentId, Code, Type, Colour, Label, Notes, SizeCategory FROM Garment `
		const searchClauses = [" Deleted=0 "]
		req.query.columns.forEach(c => {
			if (c.search.value) {
				searchClauses.push(` ${c.data} LIKE '%${c.search.value}%' `)
			}
		})
		if (searchClauses.length > 0) {
			let whereClause = " WHERE "
			whereClause += searchClauses.join(" AND ")
			recordsFiltered = db.prepare(`SELECT Count(*) as count FROM Garment ${whereClause}`).get().count
			query += whereClause
		}

		const columns = ["GarmentId", "Code", "Type", "Colour", "Label", "SizeCategory"] // sort columns 
		const orderByClause = req.query.order.map(o => ` ${columns[o.column]} COLLATE NOCASE ${o.dir} `)
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`
		const garments = db.prepare(query).all()


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data: garments.map(g => {
				const retVal = {
					DT_RowId: `row-${g.GarmentId}`
				}
				columns.forEach(col => {
					retVal[col] = g[col]
				})
				retVal.Notes = g.Notes
				return retVal
			})
		})
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


// GET a list of garments used by the garment datatable in the main garment page
router.get("/dt", function (req, res) {

	const db = getDB();

	try {

		const recordsTotal = db.prepare(`SELECT Count(*) AS count FROM Garment WHERE Deleted=0 `).get().count
		let recordsFiltered = recordsTotal

		let query = `SELECT Garment.*, s.maxdate FROM Garment 
		LEFT OUTER JOIN 
		(SELECT GarmentId, MAX(SalesTotal.OrderDate) AS maxdate
		FROM Sales 
		INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId
		GROUP BY GarmentId
		) s
		ON  s.GarmentId=Garment.GarmentId `

		const searchClauses = ["Deleted = 0"]
		req.query.columns.forEach(c => {
			if (c.search.value) {
				searchClauses.push(` ${c.data} LIKE '%${c.search.value}%' `)
			}
		})
		if (searchClauses.length > 0) {
			let whereClause = " WHERE "
			whereClause += searchClauses.join(" AND ")
			recordsFiltered = db.prepare(`SELECT Count(*) as count FROM Garment ${whereClause}`).get().count
			query += whereClause
		}

		const columns = ["SizeCategory", "Code", "Type", "Colour", "Label", "maxdate", "GarmentId"] // sort columns 
		const orderByClause = req.query.order.map(o => ` ${columns[o.column]} COLLATE NOCASE ${o.dir} `)
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`
		const garments = db.prepare(query).all()


		garments.forEach(g => {
			// for each garment, find out how many are sittng in the stockordergarment table and sum them up and add the sum in
			// they go in the "On Order column"
			let query = "SELECT "
			const sizeItems = []
			sz.sizes[g.SizeCategory].forEach(s => {
				return sizeItems.push(`SUM(${s}) AS O${s}`)
			})
			query += sizeItems.join(" , ")
			query += " FROM StockOrderGarment WHERE GarmentId=?"
			statement = db.prepare(query)
			sums = statement.get(g.GarmentId)
			for (let s in sums) {
				if (s) {
					g[s] = sums[s] || 0
				}
			}

			g.DT_RowId = `row-${g.GarmentId}`
		})


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data: garments
		})
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}
})


/* GET deleted Garments page. */
router.get("/deleted", function (req, res, next) {

	res.render("deleted/garments.ejs", {
		title: "Deleted Garments",
		user: req.auth.user,
		poweruser: res.locals.poweruser
	})
})


// GET
// returns a product search, used by product pick component
router.get("/search", function (req, res) {

		try {
			let results = productService.search(req.query)

			res.send(results)
	
		}
		catch (ex) {
			console.log(ex)
			res.statusMessage = ex.message
			res.status(400)
		}
	})


// GET 
// fetches a single garment by garment id
router.get("/:id", (req, res) => {
	const db = getDB()
	let query = `SELECT * FROM Garment WHERE GarmentId=?`
	let statement = db.prepare(query)
	const product = statement.get(req.params.id)

	// get the "on order" amounts from StockOrderGarment
	query = "SELECT "
	const sizeItems = []
	sz.sizes[product.SizeCategory].forEach(s => {
		return sizeItems.push(`SUM(${s}) AS O${s}`)
	})
	query += sizeItems.join(" , ")
	query += " FROM StockOrderGarment WHERE GarmentId=?"
	statement = db.prepare(query)
	sums = statement.get(product.GarmentId)
	for (let s in sums) {
		if (s) {
			product[s] = sums[s] || 0
		}
	}

	product.DT_RowId = `row-${product.GarmentId}`

	res.json(product).end()
})



/*************************************************************************** */


// PUT save changes to an existing item
router.put("/:id", function (req, res) {
	const db = getDB();
	try {

		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = new Date().toLocaleString()


		// get existing record from database and compare so we only save changes.
		const garment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(req.params.id)
		const changes = []
		for (let key in garment) {
			if (key == "GarmentId" || key.startsWith("Created"))
				continue
			if (req.body[key] != null &&  req.body[key].trim)
				req.body[key] = req.body[key].trim()
			if (garment[key] != req.body[key]) 
				changes.push(key)
		}

		if ( !req.body.Code || !req.body.Type || !req.body.Label || !req.body.Colour ) {
			res.statusMessage = "We require code, type, colour and label."
			res.sendStatus(400).end()
			return
		}


		let query = "UPDATE Garment SET "
		query += changes.map(c => ` ${c}=@${c} `).join(" , ")
		query += " WHERE GarmentId=@GarmentId "

		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare(query)
		let info = statement.run(req.body)
		console.log(info)

		query = `INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)`
		statement = db.prepare(query)
		info = statement.run("Garment", req.params.id, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
		console.log(info)
		const auditLogId = info.lastInsertRowid

		query = `INSERT INTO AuditLogEntry VALUES(null, ?, ?, ?, ?)`
		statement = db.prepare(query)
		for (const key of changes) {
			if (key=="LastModifiedBy" || key=="LastModifiedDateTime")
				continue;
			info = statement.run(auditLogId, key, garment[key], req.body[key])
			console.log(info)
		}

		db.prepare("COMMIT").run()

		res.json({
			LastModifiedBy: req.body.LastModifiedBy,
			LastModifiedDateTime: req.body.LastModifiedDateTime,
			changes: info.changes
		}).end()

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


// PUT to undelete a garment
router.put("/restore/:id", (req, res) => {

	const db = getDB();

	try {
		db.prepare("BEGIN TRANSACTION").run()

		const date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE Garment SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE GarmentId=?")
		statement.run(req.auth.user, date, req.params.id)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Garment", req.params.id, "UPD", req.auth.user, date)

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


/*************************************************************************** */


// POST create a new item
router.post("/", function (req, res) {
	const db = getDB();
	try {

		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()

		const columns = []
		for (const column in req.body) {
			if (req.body[column].trim)
				req.body[column] = req.body[column].trim()

			if (req.body[column]) 
				columns.push(column)
		}

		if ( !req.body.Code || !req.body.Type || !req.body.Label || !req.body.Colour ) {
			res.statusMessage = "We require code, type, colour and label."
			res.sendStatus(400).end()
			return
		}

		let query = `INSERT INTO Garment 
		( ${columns.join(", ")} ) 
		VALUES ( ${columns.map(c => ` @${c} `).join(", ")} ) `
		let statement = db.prepare(query)

		db.prepare("BEGIN TRANSACTION").run()
		let info = statement.run(req.body)
		console.log(info)

		statement = db.prepare(`INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)`)
		info = statement.run("Garment", info.lastInsertRowid, "INS", req.body.LastModifiedBy, req.body.LastModifiedDateTime)
		console.log(info)
		const auditLogId = info.lastInsertRowid

		statement = db.prepare(`INSERT INTO AuditLogEntry VALUES(null, ?, ?, null, ?)`)
		for (const column of columns) {
			if (column == "LastModifiedBy" || column == "LastModifiedDateTime" || column == "CreatedBy" || column == "CreatedDateTime")
				continue
			info = statement.run(auditLogId, column, req.body[column])
			console.log(info)
		}

		db.prepare("COMMIT").run()

		res.json({
			NewId: info.lastInsertRowid,
			CreatedBy: req.body.CreatedBy,
			CreatedDateTime: req.body.CreatedDateTime,
		}).end()


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


// DELETE set the item deleted flag to 1
router.delete("/:id", function (req, res) {
	const db = getDB();

	try {

		const date =  new Date().toLocaleString()

		db.prepare("BEGIN TRANSACTION").run()

		let info = db.prepare(`UPDATE Garment SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE GarmentId=? `).run(req.auth.user, date, req.params.id)
		console.log(info)

		info = db.prepare(`INSERT INTO AuditLog VALUES(null, ?, ?, ?, ?, ?)`).run("Garment", req.params.id, "DEL", req.auth.user, date)
		console.log(info)

		db.prepare("COMMIT").run()


		res.send(`${info.changes}`).end()


	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		if (db != null)
			db.close()
	}

})




module.exports = router