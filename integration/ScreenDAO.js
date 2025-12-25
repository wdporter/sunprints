const getDB = require("./dbFactory.js");

module.exports = class ScreenDao {
	
	constructor(db) {
		this.db = db ?? getDB()
	}

	close = function() {
		this.db.close()
	}

	/**
	 * @returns list of screens, each has ScreenId, Number, Colour and Name
	 */
	getScreensFromSalesHistory() {
		const screens = this.db.prepare(/*sql*/`SELECT ScreenId, Number, Colour, Name FROM Screen 
		WHERE ScreenId IN (
			SELECT FrontScreenId FROM Sales 
			UNION SELECT FrontScreen2Id FROM Sales 
			UNION SELECT BackScreenId FROM Sales 
			UNION SELECT BackScreen2Id FROM Sales 
			UNION SELECT SleeveScreenId FROM Sales
			UNION SELECT SleeveScreen2Id FROM Sales
			UNION SELECT PocketScreenId FROM Sales
			UNION SELECT PocketScreen2Id FROM Sales
		)
		ORDER BY 2 COLLATE NOCASE`).all();

		return screens;

	}

	/**
	 * Checks if a screen with the same name number and colour already exists. If successful, the ScreenId wil be updated with the new id
	 * @param {Object} screen an object with properties corresponding to the Screen table
	 * @returns {Boolean} true if a screen is found in the database, false otherwise
	 */
	isScreenExisting = function(screen) {
		const statement = this.db.prepare(/*sql*/`SELECT COUNT(*) AS Count 
			FROM Screen 
			WHERE  
				Name IS ?  
				AND Number IS ?
				AND  Colour IS ? ` )
		statement.pluck()
		const count = statement.get(screen.Name, screen.Number, screen.Colour)
		return count > 0
	}

	/**creates a new screen in the screen table. Missing properties will be inserted as null. 
	 * @param {Object} screen object with properties corresponding to Screen table. ScreenId will be set to the new value
	 */
	createScreen = function(screen) {

		const columns = []
		for (const column in screen) {
			if (column == "ScreenId")
					continue;
			if (screen?.[column]) { 
				columns.push(column)
			}
		}

		const query = /*sql*/`INSERT INTO Screen ( ${columns.join(", ")} ) VALUES ( ${columns.map(c => ` @${c} `).join(", ")} )`
		const statement = this.db.prepare(query)
		const info = statement.run(screen)
		console.log(info)
		screen.ScreenId = info.lastInsertRowid

		//todo:  code to insert into Audit Log if being used

	}

	/**
	 * update an existing screen
	 * @param {Object} screen an object with properties corresponding to the Screen table
	 */
	updateScreen = function(screen)
	{
		// get the existing screen because we only want to update columns that have actually changed
		const myScreen = this.db.prepare(/*sql*/`SELECT * FROM Screen WHERE ScreenId=? `).get(screen.ScreenId)
		const columns = []
		for (const column in screen) {
			if (screen[column] != myScreen[column]) {
				columns.push(column)
			}
		}
	
		const query = /*sql*/`UPDATE Screen 
			SET ${columns.map(col => `${col}=@${col}`).join(", ")}	
			WHERE ScreenId = @ScreenId `
		const statement = this.db.prepare(query)
	
		const info = statement.run(screen)
		console.log(info)

		//todo:  code to insert into Audit Log if being used
	}

	/** does a soft delete (that is, deleted=1) on the screen with the given id
	 * @param {Number} id the id of the screen to be deleted
	 * @param {String} userName name for the LastModifiedBy column	
	 */
	deleteScreen = function(id, userName) {
		const statement = this.db.prepare(/*sql*/`UPDATE Screen SET Deleted=1, LastModifiedBy=?, LastModifiedDateTime=? WHERE ScreenId=?`)
		const info = statement.run(userName, new Date().toLocaleString("en-AU"), id)
		console.log(info)
	}

}
