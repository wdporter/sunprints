
var express = require('express');
var router = express.Router();
var fs = require("fs")
const Database = require("better-sqlite3")


function isAdmin(db, username) {
	try {
		return db.prepare("SELECT * FROM User WHERE Admin=1 AND Name=?").get(username).Admin == 1
	}
	catch (ex) {
		console.log(ex)
		return false
	}
}

/* GET users listing. */
router.get('/', function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	if (isAdmin(db, req.auth.user)) {

		const users = db.prepare("SELECT * FROM User").all()

		for (user in users) {
			user.newPassword = ""
		}

		res.render("user.ejs", {
			title: "Users",
			user: req.auth.user,
			users,
			poweruser: res.locals.poweruser
		})
	}
	else {
		res.statusMessage = "not authorised to view the users page."
		res.status(500).end()
	}

	db.close()
})


// PUT update user details, name and admin
router.put("/", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		if (isAdmin(db, req.auth.user)) {

			req.body.Name = req.body.Name.trim()


			const q = `UPDATE User SET `
			let query = q
			if (req.body.Name != req.body.originalName)
				query += " Name=@Name,"
			if (req.body.Admin != req.body.originalAdmin)
				query += " Admin=@Admin,"
			if (query.endsWith(","))
				query = query.slice(0, -1)

			if (query == q) {
				res.statusMessage = "nothing has changed"
				res.sendStatus(400)
				return
			}

			query += " WHERE Name = @originalName"

			db.prepare("BEGIN TRANSACTION").run()

			let info = db.prepare(query).run(req.body)
			console.log(info)

			let statement = db.prepare("INSERT INTO AuditLog VALUES ( null, ?, 0, ?, ?, ?)")
			info = statement.run("User", "UPD", req.auth.user, new Date().toLocaleString())
			let auditLogId = info.lastInsertRowid
			console.log(info)
			statement = db.prepare("INSERT INTO AuditLogEntry VALUES ( null, ?, ?, ?, ?)")
			if (req.body.Name != req.body.originalName) {
				info = statement.run(auditLogId, "Name", req.body.originalName, req.body.Name)
				console.log(info)
			}
			if (req.body.Admin != req.body.originalAdmin) {
				info = statement.run(auditLogId, "Admin", req.body.originalAdmin, req.body.Admin)
				console.log(info)
			}


			db.prepare("COMMIT").run()


			res.send("ok")


		}

		else {
			res.statusMessage = "not authorised to view the users page."
			res.status(500).end()
		}

	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		console.log(ex)
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}
})


// PUT update user password
router.put("/pw", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		if (isAdmin(db, req.auth.user)) {

			req.body.Password = req.body.Password?.trim() ?? ""
			if (!req.body.Password) {
				res.statusMessage = "nothing to save"
				res.sendStatus(400)
				return
			}

			req.body.Password = require('crypto').createHash('md5').update(req.body.Password).digest("hex")


			db.prepare("BEGIN TRANSACTION").run()
			let query = "UPDATE User SET Password = @Password WHERE Name=@Name"
			let info = db.prepare(query).run(req.body)
			console.log(info)

			info = db.prepare(`INSERT INTO AuditLog VALUES (null, 'User', ${info.lastInsertRowid}, 'UPD', '${req.auth.user}', '${new Date().toLocaleString()}') `).run()
			console.log(info)

			db.prepare("COMMIT").run()

			res.send("ok")
		}
		else {
			res.statusMessage = "not authorised to view the users page."
			res.status(500).end()
		}


	}
	catch (ex) {
		db.prepare("ROLLBACK").run()
		console.log(ex)
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}
})


router.post("/", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		if (isAdmin(db, req.auth.user)) {

			req.body.Name = req.body.Name?.trim() ?? ""
			req.body.Password = req.body.Password?.trim()  ?? ""

			if (req.body.Name == "" || req.body.Password == "") {
				res.statusMessage = "We require a name and password"
				res.sendStatus(400)
				return
			}

			req.body.Password = require('crypto').createHash('md5').update(req.body.Password).digest("hex")

			const query = `INSERT INTO User VALUES (@Name, @Password, @Admin)`

			db.prepare("BEGIN TRANSACTION").run()

			let info = db.prepare(query).run(req.body)
			console.log(info)

			info = db.prepare(`INSERT INTO AuditLog Values ( null, 'User', ${info.lastInsertRowid}, 'INS', '${req.auth.user}', '${new Date().toLocaleString()}' )`).run()
			console.log(info)
			info = db.prepare(`INSERT INTO AuditLogEntry Values ( null, ${info.lastInsertRowid}, 'Name', null, ?)`).run(req.body.Name)
			console.log(info)

			db.prepare("COMMIT").run()

			res.send("ok")
		}
		else {
			db.prepare("ROLLBACK").run()
			res.statusMessage = "not authorised to view the users page."
			res.status(500).end()
		}

	}
	catch (ex) {
		console.log(ex)
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}
})


module.exports = router;
