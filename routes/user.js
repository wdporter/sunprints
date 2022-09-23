
var express = require('express');
var router = express.Router();
var fs = require("fs")
const Database = require("better-sqlite3")


/* GET users listing. */
router.get('/', function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	if (res.locals.admin) {

		const users = db.prepare("SELECT * FROM User").all()

		res.render("user.ejs", {
			title: "Users",
			user: req.auth.user,
			users
		})
	}
	else {
		res.statusMessage = "not authorised to view the users page."
		res.status(500).end()
	}

	db.close()
})



/* GET users edit  page. */
router.get('/edit/:name', function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		if (res.locals.admin) {
			const user = db.prepare("SELECT * FROM User WHERE Name=?").get(req.params.name)

			res.render("user_edit.ejs", {
				title: "Edit user",
				user: req.auth.user,
				userObj: user
			})
		}
		else {
			res.statusMessage = "not authorised to view the users page."
			res.status(500).end()
		}
	}
	catch(err) {
		console.log(ex)
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}
})



/* GET users new user page. */
router.get('/edit/', function (req, res, next) {

	if (res.locals.admin) {
			const user = {
			Name: "",
			Admin: false,
			SalesRep: false,
			PowerUser: false
		}
		res.render("user_edit.ejs", {
			title: "Create user",
			user: req.auth.user,
			userObj: user
		})
	}
	else {
		res.statusMessage = "not authorised to view the users page."
		res.status(500).end()
	}

})


/* POST save user details */
router.post('/edit/', function (req, res) {
	if (res.locals.admin) {
		
		const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

		try {

			for (key in req.body) {
				if (req.body[key] == "on")
					req.body[key] = 1
				else 
					req.body[key] = req.body[key].trim()
			}

			if (req.body.Password.length >  0)
				req.body.Password = require('crypto').createHash('md5').update(req.body.Password).digest("hex")
			else
				delete req.body.Password

			db.prepare("BEGIN TRANSACTION").run()

			const user = db.prepare("SELECT rowid, * FROM User WHERE Name=?").get(req.body.originalName)
			if (user) {
				// it's an update
				// get changed columns
				const changed = Object.keys(req.body).filter(k => k != "originalName" && user[k] != req.body[k])
				db.prepare(`UPDATE User SET ${changed.map(c => `${c}=@${c}`)} WHERE Name=@originalName`)
				.run(req.body)

				const auditLogId = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, 'UPD', ?, ? )")
					.run("User", user.rowid, req.auth.user, new Date().toLocaleString())
					.lastInsertRowid

				const statement = db.prepare("INSERT INTO AuditLogEntry VALUES(null, ? , ? , ?, ?)")
				delete req.body.Password
				for (c of changed) {
					statement.run(auditLogId, c, user[c], req.body[c])
				}

			}
			else {
				// it's an insert
				delete req.body.originalName
				const newid = db.prepare(`INSERT INTO USER (${Object.keys(req.body).join(", ")}) VALUES (${Object.keys(req.body).map(k => `@${k}`).join(", ")})`)
					.run(req.body)
					.lastInsertRowid

				const auditLogId = db.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, 'INS', ?, ? )")
					.run("User", newid, req.auth.user, new Date().toLocaleString())
					.lastInsertRowid

				const statement = db.prepare("INSERT INTO AuditLogEntry VALUES(null, ? , ? , null, ?)")
				delete req.body.Password
				for (key in req.body) {
					statement.run(auditLogId, key, req.body[key])
				}

			}

			db.prepare("COMMIT").run()
			res.redirect("/user")
		}
		catch(err) {
			db.prepare("ROLLBACK").run()
			res.statusMessage = err.message
			res.sendStatus(400)
		}
		finally {
			db.close()
		}
	}
	else {
		res.statusMessage = "not authorised to view the users page."
		res.status(500).end()
	}

})



router.delete("/:name", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		if (res.locals.admin) {
			db.prepare("BEGIN TRANSACTION").run()

			const user = db.prepare("SELECT rowid, Name, Admin, SalesRep, PowerUser FROM User WHERE Name=?").get(req.params.name)

			db.prepare("DELETE FROM User WHERE Name=?").run(req.params.name)

			const date = new Date()
			const auditLogId = db
				.prepare("INSERT INTO AuditLog VALUES (null, ?, ?, 'DEL', ?, ? )")
				.run("User", user.rowid, req.auth.user, date.toLocaleString())
				.lastInsertRowid

			const query = db.prepare("INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, null)")
			for (key in user) {
				query.run(auditLogId, key, user[key])
			}

			db.prepare("COMMIT").run()

			res.send("ok")
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

module.exports = router;
