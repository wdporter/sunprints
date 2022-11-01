const { locations } = require("../config/art.js")

module.exports = class TransferDao {

	constructor(db) {
		this.db = db
	}

	searchDesign(location, terms) {

		let query = /*sql*/`
			SELECT DISTINCT TransferDesignId, Code, Notes, SizeCategory
			FROM TransferDesign
			INNER JOIN TransferNameTransferDesign USING (TransferDesignId)
			WHERE Deleted=0
			AND ${location}=1 
			`

		const validParams = ["code", "notes"]
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


	getMedia(location, designId, terms) {
		if (!locations.includes(location))
			throw new Error(`error: bad parameter - location: ${location}`)

		let query = /*sql*/`
SELECT TransferNameId AS id, Name 
FROM TransferName
INNER JOIN TransferNameTransferDesign USING (TransferNameId)
WHERE TransferDesignId = ?
AND ${location} = 1 
AND Deleted = 0`

		const recordset = this.db.prepare(query).all(designId)

		return recordset
	}

}
