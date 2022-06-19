const express = require("express")
const router = express.Router()

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("home.ejs", { 
		title: "Home", 
		user: req.auth.user,
	})
})

module.exports = router
