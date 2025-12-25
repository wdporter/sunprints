const getDB = require("../integration/dbFactory.js")
const ScreenService = require("../service/ScreenService.js");

/** a class with static methods for the Screen table */
class ScreenController {

	static columns = ["ScreenId", "Name", "Number", "Colour"]


	/** creates a new screen 
	 * @param {Object} req The request object. It should have a body property that represents the new screen. ScreenId is ignored
	 * @param {Object} res The response object. It will be set to a 201 for success or 400 for a handled error
	*/
  static createScreen(req, res, next) {

		const screen = {}
		for(const column of ScreenController.columns.slice(1)) {
			screen[column] = req.body[column]
		}

		const db = getDB()
		try {
			const screenService = new ScreenService(db)
			screenService.create(screen, req.auth.user)
			res.location(`/screen/${screen.ScreenId}`)
			res.status(201)
			res.json({
				success: true,
				message: "saved ok",
				data: screen,
				timestamp: new Date().toISOString()
			})
		}
		catch(error) {
			return res.status(400).json({ 
				error: error.message,
				details: [{
					path: error.cause?.path,
					msg: error.cause?.msg
				}]
			})
		}
		finally {
			db.close()
		}

	}

	/** update an existing screen
	 * @param {Object} req The request object. It should have a body property that represents the new screen
	 * @param {Object} res The response object. It will be set to a 204 for success or 400 for a handled error
	 */
	static updateScreen(req, res) {
		const screen = {}
		for(const column of ScreenController.columns) {
			screen[column] = req.body[column]
		}

		const db = getDB()
		const service = new ScreenService(db)
		try {
			service.update(screen, req.auth.user)
			res.sendStatus(204)
		}
		catch(error) {
			return res.status(400).json({ 
				error: error.message,
				details: [{
					path: error?.cause?.path,
					msg: error?.cause?.msg
				}]
			})
		}
		finally {
			db.close()
		}
	}

	/** soft delete, sets Deleted field to 1 and it won't be shown on the screens page */
	static deleteScreen(req, res) {
		const db = getDB()
		const service = new ScreenService(db)
		try {
			service.delete(req.params.id, req.auth.user)
			res.sendStatus(204)
		}
		finally {
			db.close()
		}
		
	}

}



	



module.exports = ScreenController