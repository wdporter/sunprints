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

	searchMedia(location, designId, terms) {
		if (!locations.includes(location))
			throw new Error(`error: bad parameter - location: ${location}`)

		const params = [designId]

		let query = /*sql*/`	
				SELECT UsbId, Number, Notes 
				FROM Usb
				INNER JOIN UsbEmbroideryDesign USING (UsbId)
				WHERE EmbroideryDesignId = ${designId}
				AND ${location}=1 `

		const fields = ["Number", "Notes"]

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
