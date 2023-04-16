const express = require("express")
const router = express.Router()
const getDb = require("../integration/dbFactory")

/* GET home page. */
router.get("/", function(req, res, next) {

	// get customers requiring follow up
	let db = null
	let customers = []
	try {
		db = getDb()
		const query = /*sql*/`SELECT 
		CustomerId, Company, Locality, State, Email, PhoneOffice, PhoneHome, PhoneMobile, 
		DATE(FollowUpDate, 'unixepoch') AS FollowUpDate,
		CASE WHEN STRFTIME('%s') <= FollowUpDate THEN 1 ELSE 0 END AS NeedsFollowUp
		FROM Customer
		WHERE NeedsFollowUp=1
		ORDER BY Customer.FollowUpDate`

		customers = db.prepare(query).all()

	} catch (error) {
		console.log(error)
	}
	finally {
		db.close()
	}

  res.render("home.ejs", { 
		customers: customers,
		title: "Home", 
		user: req.auth.user,
		poweruser: res.locals.poweruser
	})
})

module.exports = router
