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


	searchMedia(location, designId, terms) {
		if (!locations.includes(location))
			throw new Error(`error: bad parameter - location: ${location}`)

		let query = /*sql*/`	
				SELECT TransferNameId, Name 
				FROM Usb
				INNER JOIN TransferNameTransferDesign USING (TransferNameId)
				WHERE TransferDesignId = ${designId}
				AND ${location}=1 
				AND Name LIKE ?`

		const statement = db.prepare(query)
		const params = [designId, `%${terms.name}%`]
		const recordset = db.all(params)

		return recordset
	}

}
