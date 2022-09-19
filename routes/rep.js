const express = require("express")
const router = express.Router()

const Database = require("better-sqlite3")

router.get("/", (req, res)=> {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		reps = db.prepare("SELECT SalesRepId, Name, Deleted FROM SalesRep ORDER BY Deleted, Name").all()
		reps.forEach(r => { 
			r.active = !r.Deleted 
		})

		res.render("rep.ejs", { 
			title: "Sales Representatives",
			user: req.auth.user,
			reps,
			poweruser: res.locals.poweruser
		 })
	}

	catch(ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(message)

	}

	finally {
		db.close()
	}

})


// POST create a new sales rep
router.post("/", (req, res)=> {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	const date = new Date().toLocaleString()

	if (req.body.Name.length == 0) {
		res.statusMessage = "We require a name"
		res.sendStatus(400)
		res.end()
	}

	try {

		const one = db.prepare("SELECT 1 FROM SalesRep WHERE Name=?  ").get(req.body.Name)
		if  (one) {
			res.statusMessage = "We already have that name"
			res.sendStatus(400)
			res.end()
		}

		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare("INSERT INTO SalesRep VALUES (null, ?, ?, ?, ?, ?, ?)")
		let info = statement.run(req.body.Name, req.body.Deleted, req.auth.user, date, req.auth.user, date)
		const salesRepId = info.lastInsertRowid
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("SalesRep", salesRepId, "INS", req.auth.user, date)
		const auditLogId = info.lastInsertRowid
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
		info = statement.run(auditLogId, "Name", null, req.body.Name)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
		info = statement.run(auditLogId, "Deleted", null, req.body.Deleted)
		console.log(info)

		db.prepare("COMMIT").run()

		res.send(String(salesRepId)).end()

	}

	catch(ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(ex)

	}

	finally {
		db.close()
	}


})


// PUT edit an existing sales rep
router.put("/:id", (req, res)=> {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	const date = new Date().toLocaleString()

	if (req.body.Name.length == 0) {
		res.statusMessage = "We require a name"
		res.sendStatus(400)
		res.end()
	}

	try {

		const count = db.prepare("SELECT Count(*) AS Count FROM SalesRep WHERE Name=? AND SalesRepId <> ?  ").all(req.body.Name, req.params.id).Count
		if  (count >= 1) {
			res.statusMessage = "We already have that name"
			res.sendStatus(400)
			res.end()
		}
		
		const existing = db.prepare("SELECT * FROM SalesRep WHERE SalesRepId=?").get(req.params.id)

		const cols = []
		if (req.body.Name != existing.Name)
			cols.push( "Name")
		if (req.body.Deleted != existing.Deleted)
			cols.push( "Deleted")

		if (cols.length == 0) {
			res.statusMessage = "We have nothing to update"
			res.sendStatus(400)
			res.end()
		}

		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = new Date().toLocaleString()
		cols.push ("LastModifiedBy", "LastModifiedDateTime")
		let query = `UPDATE SalesRep SET ${cols.map(c => ` ${c}=@${c} `).join(", ")} WHERE SalesRepId = @SalesRepId `
		let statement = db.prepare(query)

		db.prepare("BEGIN TRANSACTION").run()

		let info = statement.run(req.body)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, ?, ?, ?)")
		info = statement.run("SalesRep", req.params.id, "UPD", req.auth.user, req.body.LastModifiedDateTime)
		const auditLogId = info.lastInsertRowid
		console.log(info)

		if (cols.includes("Name")) {
			statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
			info = statement.run(auditLogId, "Name", existing.Name, req.body.Name)
			console.log(info)
		}

		if (cols.includes("Deleted")) {
			statement = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)")
			info = statement.run(auditLogId, "Deleted", null, req.body.Deleted)
			console.log(info)
		}

		db.prepare("COMMIT").run()

		res.send("ok").end()

	}

	catch(ex) {
		db.prepare("ROLLBACK").run()
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(ex)

	}

	finally {
		db.close()
	}


})





module.exports = router