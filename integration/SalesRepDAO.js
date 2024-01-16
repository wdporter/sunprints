/**
 * SalesRep Data Access Object
 * @module 
 * @see dbFactory.js
 */



module.exports = class SalesRepDao {

	/**
	 * Create the Sales Rep Data Access Object
	 * @constructor
	 * @param {object} db a db object created by dbFactory, supports "get", "all" and "run"
	 */
	constructor(db) {
		this.db = db
	}

	/**
	 * Returns an array of sales rep names
	 * @param {boolean} includeDeleted whether to return to the deleted sales reps also
	 * @returns {array} the name property of each sales rep 
	 */
	all(includeDeleted = false) {

		let query = /*sql*/`SELECT * FROM SalesRep `
		if (!includeDeleted) {
			query += /*sql*/` WHERE Deleted=0`
		}

		query += /*sql*/` ORDER BY Deleted, Name`;

		const retVal = this.db.prepare(query).all()
		return retVal

	}


}