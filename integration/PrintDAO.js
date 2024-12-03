const { locations } = require("../config/art.js")

module.exports = class PrintDao {

	constructor(db) {
		this.db = db
	}

	searchDesign(location, terms) {

		let query = /*sql*/`
			SELECT DISTINCT PrintDesignId, Code, Notes, Comments, SizeCategory
			FROM PrintDesign
			INNER JOIN ScreenPrintDesign USING (PrintDesignId)
			WHERE Deleted=0
			AND ${location}=1 
			`

		const validParams = ["code", "notes", "comments"]
		const params = []
		Object.keys(terms).forEach(t => {
			if (!validParams.includes(t) || !terms[t])
				return
			query += ` AND ${t} LIKE ? `
			params.push(`%${terms[t]}%`)
		})

		const records = this.db.prepare(query).all(params)


		return records

	}

	getMedia(location, designId) {

		if (!locations.includes(location))
			throw new Error(`error: bad parameter - location: ${location}`)

		let query = /*sql*/`
SELECT ScreenId AS id, Name, Number, Colour 
FROM Screen
INNER JOIN ScreenPrintDesign USING (ScreenId)
WHERE PrintDesignId = ?
AND ${location}=1 
AND NOT Name IS NULL
AND Deleted=0
ORDER BY Name`


		const recordset = this.db.prepare(query).all(designId)

		return recordset
	}


	getStandardScreens(id) {
		let query = /*sql*/`
		SELECT Number || ' ' || IFNULL(Colour, '') AS Name
		FROM Screen
		INNER JOIN ScreenPrintDesign USING (ScreenId)
		INNER JOIN PrintDesign USING (PrintDesignId)
		WHERE PrintDesignId=?
		AND Name IS NULL
		AND Screen.Deleted=0`
		const recordset = this.db.prepare(query).all(id)
		
		return recordset


	}

	/**
	 * 
	 * @returns list of prints, each has PrintDesignId, Notes and Code - can later add comments if needed
	 */
	getPrintsFromSalesHistory() {
		const prints = this.db.prepare(/*sql*/`SELECT PrintDesignId, TRIM(Code, '	') AS Code, IFNULL(Notes, '') AS Notes 
		FROM PrintDesign 
		WHERE PrintDesignId IN 
			(SELECT FrontPrintDesignId FROM Sales 
			UNION SELECT BackPrintDesignId FROM Sales 
			UNION SELECT PocketPrintDesignId FROM Sales 
			UNION SELECT SleevePrintDesignId FROM Sales) 
		ORDER BY Code COLLATE NOCASE`).all();

		return prints;

	}

}
