
module.exports = class ScreenDao {

	constructor(db) {
		this.db = db
	}

	/**
	 * 
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

}
