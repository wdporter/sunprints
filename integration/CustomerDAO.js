const { allSizes } = require("../config/sizes.js") // todo, do we need this here ?

/**
 * Customer Data Access Object
 * @module 
 * @see dbFactory.js
 */
module.exports = class CustomerDao {

	/**
	 * Create the Customer Data Access Object
	 * @constructor
	 * @param {object} db a db object created by dbFactory
	 */
	constructor(db) {
		this.db = db
	}


	/**
	 * gets the customers that have entries in the Sales History table
	 * 
	 * @returns {Array} a list of customers with their id, company and code
	 */
	getSalesHistoryCustomers() {
		const statement = this.db.prepare("SELECT Customer.CustomerId, Customer.Company, Code FROM Customer INNER JOIN SalesTotal ON SalesTotal.CustomerId=Customer.CustomerId GROUP BY Customer.CustomerId ORDER BY 2 COLLATE NOCASE")
		const customers = statement.all();
		return customers;
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