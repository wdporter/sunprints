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
AND Deleted=0`


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

}
