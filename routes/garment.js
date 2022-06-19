const express = require("express")
const router = express.Router()
const Database = require("better-sqlite3")
const sz = require("../sizes.js");


// GET the garments page
router.get("/", function (req, res, next) {
	res.render("garment.ejs", {
		title: "Garments",
		user: req.auth.user,
		sizes: JSON.stringify(sz.sizes)
	})
})


// GET the warning list for garments
router.get("/warninglist", function (req, res, next) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		let query = "SELECT * FROM Garment WHERE Deleted=0 AND ( "
		sizeTerms = []
		for (let sizeCategory in sz.sizes) {
			for (let size of sz.sizes[sizeCategory]) {
				sizeTerms.push(`${size} < Min${size}`)
			}
		}
		query += sizeTerms.join(" OR ")
		query += " )"

		let statement = db.prepare(query)
		let garments = statement.all()

		// we have retrieved balances for all sizes, remove sizes where the balance is ok
		garments.forEach(g => {
			for (let sizeCategory in sz.sizes) {
				for (let size of sz.sizes[sizeCategory]) {
					if (g[size] >= g["Min" + size]) {
						delete g[size]
						delete g["Min" + size]
					}
				}
			}
		})


		res.render("warninglist.ejs", {
			title: "Garment Warning List",
			user: req.auth.user,
			garments,
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

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

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

		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })


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

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		const recordsTotal = db.prepare(`SELECT Count(*) AS count FROM Garment WHERE Deleted=0 `).get().count
		let recordsFiltered = recordsTotal

		let query = `SELECT Garment.*, s.maxdate FROM Garment 
		LEFT OUTER JOIN 
		(SELECT GarmentId, MAX(OrderDate) AS maxdate
		FROM Sales 
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
			}
			)
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
		user: req.auth.user
	})
})



/*************************************************************************** */


// PUT save changes to an existing item
router.put("/:id", function (req, res) {
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = new Date().toLocaleString()


		// get existing record from database and compare so we only save changes.
		const garment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(req.params.id)
		const changes = []
		for (let key in garment) {
			if (key == "GarmentId" || key.startsWith("Created"))
				continue
			if (req.body[key].trim)
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

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

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
	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
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
		for (const column in columns) {
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
	let db = null
	try {
		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

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