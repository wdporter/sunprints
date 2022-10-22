const getDB = require("./dbFactory")
const DaoBase = require("./dao_base.js")
const { allSizes } = require("../config/sizes.js")

module.exports = class CustomerDao extends DaoBase {

	constructor(db) {
		if (db) {
			super(db)
		}
		else {
			super()
		}
	}


	get(customerId) {

		try {
			const retVal = this.db.prepare("SELECT * FROM Customer WHERE CustomerId=?").get(customerId)

			return retVal
		}
		finally {
			if (this.mustClose)
				this.db.close()
		}

	}

	/**
	 * Returns an array of customers. Matches when the term appears anywhere within Company or Code, case insensitive. Not all fields are returned
	 *
	 * @param {String} term the term to search with Company or Code fields
	 * @returns {Array} matching customers, with fields blah 
	 */
	search(term) {
		try {

			let statement = this.db.prepare(/*sql*/`SELECT CustomerId, Code, Company, Locality, State, Notes AS DeliveryNotes, CustNotes AS Notes
			FROM Customer 
			WHERE Deleted=0 AND (
				Code LIKE @term 
				OR Company LIKE @term
			)`)

			term = `%${term}%`
			const recordset = statement.all({term})
			return recordset
		}
		catch(err) {
			console.log(err)
		}
		finally {
			if (this.mustClose)
				this.db.close()
		}

	}

}