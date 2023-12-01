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

	create(name, order, user) {
		try	{
			var date = new Date().toLocaleString()
			let query = /*sql*/`INSERT INTO Region (Name, [Order], CreatedBy, CreatedDateTime, LastModifiedBy, LastModifiedDateTime) VALUES (?, ?, ?, ?, ?, ?)`
			let statement = this.db.prepare(query)
			let info = statement.run(name, order, user,  date, user, date)
			return info
		}
		catch(err) {
			throw err;
		}
	}

	update(id, name, order, active, user) {
		try	{
			var date = new Date().toLocaleString()
			let query = /*sql*/`UPDATE Region SET Name = ?, [Order] = ?, Deleted=?, LastModifiedBy = ?, LastModifiedDateTime = ? WHERE RegionId = ?`
			let statement = this.db.prepare(query)
			let info = statement.run(name, order, active ? 0 : 1, user, date, id)
			return info
		}
		catch(err) {
			throw err;
		}
	}





}