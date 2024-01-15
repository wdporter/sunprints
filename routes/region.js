const express = require("express")
const router = express.Router()

const regionService = require("../service/regionServiceDeprecated.js")

router.get("/", (req, res) => {
	try {
		if (res.locals.admin) {
			const regions = regionService.all()
			res.render("region.ejs", {
				title: "Regions",
				user: req.auth.user,
				regions,
				poweruser: res.locals.poweruser
			})
		}
		else {
			res.sendStatus(403);
		}
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(message)
	}


})

router.post("/", (req, res) => {	
	try {
		if (res.locals.admin) {
			regionService.create(req.body.name, req.body.order, req.auth.user)
			res.sendStatus(204)
		}
		else {
			res.sendStatus(403);
		}
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(message)
	}

});

router.put("/:id", (req, res) => {
	try {
		if (res.locals.admin) {
			regionService.update(req.params.id, req.body.name, req.body.order, req.body.active, req.auth.user)
			res.sendStatus(204)
		}
		else {
			res.sendStatus(403);
		}
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(message)
	}


})


module.exports = router