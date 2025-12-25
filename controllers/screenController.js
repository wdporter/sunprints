const { body } = require("express-validator")
const ScreenDao = require("../integration/ScreenDAO.js")
const getDB = require("../integration/dbFactory.js")

/** a class with static methods for the Screen table */
class ScreenController {

	static columns = ["ScreenId", "Name", "Number", "Colour"]


	/** creates a new screen 
	 * @param {Object} req The request object. It should have a body property that represents the new screen. ScreenId is ignored
	*/
  static createScreen(req, res, next) {

		const screen = {}
		for(const column of ScreenController.columns.slice(1)) {
			screen[column] = req.body[column]
		}
		screen.LastModifiedBy = screen.CreatedBy = req.auth.user
		screen.LastModifiedDateTime = screen.CreatedDateTime= new Date().toLocaleString("en-AU")

		const db = getDB()
		const dao = new ScreenDao(db)
		try {
			if (dao.isScreenExisting(screen)) {
				return res.status(400).json({ 
					error: 'Validation failed',
					details: [{
						path: "name/number/colour",
						msg: "we already have this screen"
					}]
				})
			}

			dao.createScreen(screen)

			res.location(`/screen/${screen.ScreenId}`)
			res.status(201)
			res.json({
				success: true,
				message: "saved ok",
				data: screen,
				timestamp: new Date().toISOString()
			})
		}
		finally {
			db.close()
		}

	}

	/** update an existing screen
	 * @param {Object} req The request object. It should have a body property that represents the new screen
	 */
	static updateScreen(req, res) {
		const screen = {}
		for(const column of ScreenController.columns) {
			screen[column] = req.body[column]
		}
		screen.LastModifiedBy = req.auth.user
		screen.LastModifiedDateTime = new Date().toLocaleString("en-AU")

		const db = getDB()
		const dao = new ScreenDao(db)
		try {
			if (dao.isScreenExisting(screen)) {
				return res.status(400).json({ 
					error: 'Validation failed',
					details: [{
						path: "name/number/colour",
						msg: "we already have this screen"
					}]
				})
			}

			dao.updateScreen(screen)
			res.sendStatus(204)
		}
		finally {
			db.close()
		}
	}

	/** soft delete, sets Deleted field to 1 and it won't be shown on the screens page */
	static deleteScreen(req, res) {
		const db = getDB()
		const dao = new ScreenDao(db)
		try {
			dao.deleteScreen(req.params.id, req.auth.user)
			res.sendStatus(204)
		}
		finally {
			db.close()
		}
		
	}

	/** validation rules for a screen */
	static screenValidation = [
		body("Number").trim().customSanitizer(value => value == "" ? null : value),
		body("Name").trim().customSanitizer(value => value == "" ? null : value),
		body("Colour").trim().customSanitizer(value => value == "" ? null : value)
	]
}



	



module.exports = ScreenController