const { body } = require("express-validator");
const ScreenDao = require("../integration/ScreenDAO.js");
const {nameAuditColumns, dateAuditColumns } = require("../config/auditColumns.js")

/** a class with static methods for the Screen table */
class ScreenController {

	static columns = ["ScreenId", "Name", "Number", "Colour"]


	/** creates a new screen 
	 * @param {Object} req The request object. It should have a body property that represents the new screen. ScreenId is ignored
	*/
  static createScreen(req, res, next) {

	const screen = {}
	for(const column of ScreenController.columns) {
		screen[column] = req.body[column]
	}
	screen.LastModifiedBy = req.auth.user
	screen.LastModifiedDateTime = new Date().toLocaleString("en-AU")
	
	const dao = new ScreenDao()
	try {

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
			dao.close
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
		for(const column of nameAuditColumns) {
		screen[column] = req.auth.user
		}
		for(const column of dateAuditColumns) {
			screen[column] = new Date().toLocaleString("en-AU")
		}

		const dao = new ScreenDao()
		try {
			dao.updateScreen(screen)
			res.sendStatus(204)
		}
		finally {
			dao.close
		}
	}

	/** soft delete, sets Deleted field to 1 and it won't be shown on the screens page */
	static deleteScreen(req, res) {
		const dao = new ScreenDao()
		try {
			dao.deleteScreen(req.params.id, req.auth.user)
			res.sendStatus(204)
		}
		finally {
			dao.close()
		}
		
	}

	/** validation rules for a screen */
	static screenValidation = [
		body("Number").trim().customSanitizer(value => value == "" ? null : value),
		body("Name").trim().customSanitizer(value => value == "" ? null : value),
		body("Colour").trim().customSanitizer(value => value == "" ? null : value),
		body().custom(screen => {
			const dao = new ScreenDao()
			const retVal = dao.isScreenExisting(screen)
			dao.close()
			return !retVal
		 }).withMessage("we already have this screen")
	]
}



	



module.exports = ScreenController