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

	searchMedia(location, designId, terms) {
		if (!locations.includes(location))
			throw new Error(`error: bad parameter - location: ${location}`)

		const params = [designId]

		let query = /*sql*/`	
				SELECT ScreenId, Code, Notes, Comments 
				FROM Screen
				INNER JOIN ScreenPrintDesign USING (ScreenId)
				WHERE PrintDesignId = ${designId}
				AND ${location}=1 
			`

		const fields = ["Name", "Number", "Colour"]

		fields.forEach(f => {
			if (terms[f]) {
				query += ` AND ${f} LIKE ? `
				params.push(`%${terms[f]}%`)
			}
		})

		const statement = db.prepare(query)
		const recordset = db.all(params)

		return recordset
	}

}
