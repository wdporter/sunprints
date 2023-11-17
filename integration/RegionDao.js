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
	 * Returns an array of regions
	 * @param {boolean} includeDeleted whether to return to the deleted regions
	 * @returns {array} a list of Region entitites 
	 */
	all(includeDeleted = false) {

		let query = "SELECT * FROM Region "
		if (!includeDeleted)
			query += " WHERE Deleted=0 "
		query += "GROUP BY RegionId ORDER BY COUNT(RegionId) DESC"

		const retVal = this.db.prepare(query).all()
		return retVal

	}

}