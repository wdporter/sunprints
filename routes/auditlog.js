const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");


/* GET audit log page. */
router.get("/", function (req, res, next) {
	res.render("auditlog.ejs", {
		title: "Audit Log",
		stylesheets: ["/stylesheets/auditlog-theme.css", "/stylesheets/vue3-easy-data-table.css" ],
		user: req.auth.user,
		useNewHeader: true
	})
});

router.post("/edt", (req, res, next) => {
	const db = getDB();
	let query = /*sql*/`SELECT COUNT(*) FROM AuditLog`;
	let statement = db.prepare(query);
	statement.pluck(true);
	let resultset = statement.get();
	const result = { count: resultset };

	query = /*sql*/`SELECT AuditLogId, ObjectName, Identifier, AuditAction, CreatedBy, substring(CreatedDateTime, 7,4) 
	|| '-' 
	|| substring(CreatedDateTime, 4,2)
	|| '-' 
	|| substring(CreatedDateTime, 1,2)
	|| 'T'
	|| CASE substring(CreatedDateTime, -2, 2 ) WHEN 'pm' THEN CAST(substring(CreatedDateTime, -11, 2) AS INT) + 12 ELSE printf('%02d', substring(CreatedDateTime, -11, 2)) END
	|| ':'
	|| substring(CreatedDateTime, -8, 5) AS CreatedDateTime
	FROM AuditLog 
	ORDER BY ${req.body.sortBy} ${req.body.sortType}
	LIMIT ${req.body.rowsPerPage} OFFSET ${(req.body.page - 1) * req.body.rowsPerPage}`;
	statement = db.prepare(query);
	resultset = statement.all();
	result.data = resultset;

	res.send(result)

});


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
