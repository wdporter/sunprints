const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");


/* GET audit log page. */
router.get("/", function (req, res, next) {
	res.render("auditlog.ejs", {
		title: "Audit Log",
		stylesheets: ["/stylesheets/fixedHeader.dataTables.min.css", "/stylesheets/auditlog-theme.css"],
		user: req.auth.user
	})
})


// GET return a listing in DataTables format
router.get("/dt", function (req, res) {
	const db = getDB();
	try {
		const recordsTotal = db.prepare("SELECT COUNT(*) AS Count FROM AuditLogEntry").get().Count
		let recordsFiltered = recordsTotal

		const columns = ["ObjectName", "Identifier", "AuditAction", "PropertyName", "OldValue", "NewValue", "CreatedBy", "CreatedDateTime"]

		let query = `SELECT ${columns.join(", ")}
		FROM AuditLogEntry 
		INNER JOIN AuditLog ON AuditLog.AuditLogId=AuditLogEntry.AuditLogId`

		let where = []
		for (key in req.query.extraSearch) {
			if (key == "CreatedDateTime" ) {
				let date = new Date(req.query.extraSearch.CreatedDateTime).toLocaleDateString()
				where.push( ` CreatedDateTime LIKE '${date}%' ` )
			}	
			else if (key=="Identifier" )
					where.push(` ${key} = ${req.query.extraSearch[key]} `)
			else if (key=="ObjectName" )
				where.push(` ${key} = '${req.query.extraSearch[key]}' `)
			else
					where.push(` ${key} LIKE '%${req.query.extraSearch[key]}%' `)
			
		}

		let whereClause = " WHERE "
		if (where.length > 0) {
			whereClause += where.join(" AND ")

			recordsFiltered = db.prepare(`SELECT COUNT(*) AS Count FROM AuditLogEntry 
			INNER JOIN AuditLog ON AuditLog.AuditLogId=AuditLogEntry.AuditLogId 
			${whereClause} `).get().Count

			query += whereClause;
		}

		const orderByClause = req.query.order.map(o => ` ${Number(o.column)+1} COLLATE NOCASE ${o.dir} `)
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += ` LIMIT ${req.query.length} OFFSET ${req.query.start} `

		const data = db.prepare(query).all()

		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data
		})
	}
	catch (ex) {
		console.log(`error: post("/dt") ${ex}`)
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}
})


router.get("/:id/entries", (req, res) => {
	const db = getDB();
	try {
		const entries = db.prepare("SELECT * FROM AuditLogEntry WHERE AuditLogId=?").all(req.params.id)

		entries.forEach(e => {
			try {
				if (e.OldValue?.endsWith(".0") ?? false)
					e.OldValue = parseInt(e.OldValue)

				if (e.NewValue?.endsWith(".0") ?? false)
					e.NewValue = parseInt(e.NewValue)
			}
			catch (ex) {
				// do nothing
				console.log(ex)
			}
		})


		res.send(entries)
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



module.exports = router
