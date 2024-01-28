/**
 * this is for very strict api type calls
 * we just load what's from the database
 */

const express = require("express")
const router = express.Router()
const orderService = require("../service/orderServiceDeprecated.js")


router.post("/order", (req, res) => {
	try {

		const { savedOrder, errors } = orderService.createNew(req.body, req.auth.user)

		if (!errors || errors.length == 0) {
			res.status(201)
			res.set("Location", `http://sunprints/api/order/${savedOrder.OrderId}`)
			res.json(savedOrder)
		}
		else {
			res.status(400)
			res.statusMessage = JSON.stringify(errors)
			res.json(errors)
		}
		res.send()
	}
	catch (ex) {
		res.status(400)
		res.statusMessage = ex.message
		res.send(ex)
		console.log(ex.message)
	}

})

router.put("/order/:id", (req, res) => {
	try {

		const { savedOrder, errors } = orderService.update(req.body, req.auth.user)

		if (errors.length == 0) {
			res.json(savedOrder)
		}
		else {
			res.status(400)
			res.statusMessage = JSON.stringify(errors)
			res.json(errors)
		}
		res.send()
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		console.log(ex.message)
	}

})



module.exports = router