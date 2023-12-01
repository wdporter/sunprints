const { allSizes } = require("../config/sizes.js")

/**
 * Customer Data Access Object
 * @module 
 * @see dbFactory.js
 */
module.exports = class CustomerDao {

	/**
	 * Create the Customer Data Access Object
	 * @constructor
	 * @param {object} db a db object created by dbFactory, supports "get", "all" and "run"
	 */
	constructor(db) {
		this.db = db
	}

	/**
	 * 
	 * @param {int} customerId the id of the customer to be returned
	 * @returns {object} an object with all fields of the customer
	 */
	get(customerId) {

		const retVal = this.db.prepare("SELECT * FROM Customer WHERE CustomerId=?").get(customerId)

		return retVal

	}

	/**
	 * Returns an array of customers. Matches when the term appears anywhere within Company or Code, case insensitive. Not all fields are returned
	 *
	 * @param {string} term the term to search with Company or Code fields
	 * @returns {array} matching customers, with fields blah 
	 */
	search(term) {

		let statement = this.db.prepare(/*sql*/`SELECT CustomerId, Code, Company, Locality, State, Notes AS DeliveryNotes, CustNotes AS Notes, RegionId, SalesRep
			FROM Customer 
			WHERE Deleted=0 AND (
				Code LIKE @term 
				OR Company LIKE @term
			)
			ORDER BY Company`)

		term = `%${term}%`
		const recordset = statement.all({ term })
		return recordset

	}



}