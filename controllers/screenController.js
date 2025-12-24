const getDB = require("../integration/dbFactory");
const { body } = require("express-validator");

/** a class with static methods for the Screen table */
class ScreenController {

	/** checks if the given screen already exists in the database 
	 * @returns true if it exists, false if it doesn't exist
	*/
	static checkExists(screen) {
		let db
		try {
			db = getDB();
			const statement = db.prepare(/*sql*/`SELECT 1 FROM Screen WHERE  
				Name IS ?  
				AND Number IS ?
				AND  Colour IS ? ` )
			statement.pluck()
			const value = statement.get(screen.Name, screen.Number, screen.Colour) ?? 0
			return value == 1;
		}
		finally {
			db ?? db.close()
		}
	}


	/** creates a new screen 
	 * @param {Object} req The request object that needs a body property that represents the new screen
	*/
  static createScreen(req, res, next) {

		const screen = req.body

		delete screen.ScreenId
		screen.CreatedBy = screen.LastModifiedBy = req.auth.user
		screen.CreatedDateTime = screen.LastModifiedDateTime = new Date().toLocaleString()

		const columns = []
		for (const column in screen) {
			if (screen[column] != null) { 
				columns.push(column)
			}
		}

		const query = /*sql*/`INSERT INTO Screen ( ${columns.join(", ")} ) VALUES ( ${columns.map(c => ` @${c} `).join(", ")} )`
		let db, info
		try {
			db = getDB();
			const statement = db.prepare(query)
			info = statement.run(screen)
		}
		finally {
			db ?? db.close()
		}

		console.log(info)
		screen.ScreenId = info.lastInsertRowid
		res.location(`/screen/${screen.ScreenId}`)
		res.status(201)
		res.json({
			success: true,
			message: "saved ok",
			data: screen,
			timestamp: new Date().toISOString()
		})

		//todo:  code to insert into Audit Log was here
	}

	/** edit an existing screen
	 * @param {Object} req The request object that needs a body property that represents the changed screen
	 */
	static editScreen(req, res) {
		
		const screen = req.body

		delete screen.LastUsed
		delete screen.expandLoading
		delete screen.prints
	
		screen.LastModifiedDateTime = new Date().toLocaleString()
		screen.LastModifiedBy = req.auth.user
			
			// find changed values
			let db, info
			try {
				db = getDB();
				// get the existing screen because we only want to update columns that have actually changed
				// todo: create auditing environment variable
				const myScreen = db.prepare(/*sql*/`SELECT * FROM Screen WHERE ScreenId=?`).get(req.params.id)
				const columns = []
				for (const column in screen) {
					if (screen[column] != myScreen[column]) {
						columns.push(column)
					}
				}
	
				const query = /*sql*/`UPDATE Screen 
					SET ${columns.map(col => `${col}=@${col}`).join(", ")}	
					WHERE ScreenId = @ScreenId `
				const statement = db.prepare(query)
	
				info = statement.run(screen)
			}
			finally {
				db ?? db.close
			}

			console.log(info)
			res.sendStatus(204)
	
		// deleted some code here to write change to audit logs
	}

	/** soft delete, sets Deleted field to 1 and it won't be shown on the screens page */
	static deleteScreen(req, res) {
		let db, info
		let date = new Date().toLocaleString()
		try {
			db = getDB();
			let statement = db.prepare(/*sql*/`UPDATE Screen SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE ScreenId=?`)
			info = statement.run(req.auth.user, date, req.params.id)
		}
		finally {
			db ?? db.close()
		}
		console.log(info)
		res.sendStatus(204)
	}

	/** validation rules for a screen */
	static screenValidation = [
		body("Number").trim(),
		// empty strings are not allowed for a Name
		body("Name").trim().customSanitizer(value => value == "" ? null : value),
		body("Colour").trim(),
		body().custom(screen => {
			return ScreenController.checkExists(screen)  ? false : true
		 }).withMessage("we already have this screen")
	]
}



	



module.exports = ScreenController