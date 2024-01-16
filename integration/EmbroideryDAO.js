const { locations } = require("../config/art.js")

module.exports = class EmbroideryDao {

	constructor(db) {
		this.db = db
	}

	searchDesign(location, terms) {

		let query = /*sql*/`
			SELECT DISTINCT EmbroideryDesignId, Code, Notes, Comments, SizeCategory
			FROM EmbroideryDesign
			INNER JOIN UsbEmbroideryDesign USING (EmbroideryDesignId)
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
		try {
			const records = this.db.prepare(query).all(params)
			return records

		}
		catch (err) {
			console.log(err)
			throw err
		}
	}

	getMedia(location, designId) {
		if (!locations.includes(location))
			throw new Error(`error: bad parameter - location: ${location}`)

		let query = /*sql*/`
SELECT UsbId AS id, Number, Notes 
FROM Usb
INNER JOIN UsbEmbroideryDesign USING (UsbId)
WHERE EmbroideryDesignId = ?
AND ${location} = 1 
AND Deleted = 0`

		const recordset = this.db.prepare(query).all(designId)

		return recordset
	}

	/**
	 * 
	 * @returns list of embroidery designs, each has ScreenId, Number, Colour and Name
	 */
	getEmbroideriesFromSalesHistory() {
		const embroideries = this.db.prepare(/*sql*/`SELECT EmbroideryDesignId, Code, Notes, Comments 
		FROM EmbroideryDesign 
		WHERE EmbroideryDesignId IN (
			SELECT FrontEmbroideryDesignId FROM Sales 
			UNION SELECT BackEmbroideryDesignId FROM Sales 
			UNION SELECT PocketEmbroideryDesignId FROM Sales 
			UNION SELECT SleeveEmbroideryDesignId FROM Sales) 
		ORDER BY 2 COLLATE NOCASE`).all();

		return embroideries;
	}

}

