const getDB = require("./dbFactory")
const DaoBase = require("./dao_base.js")

module.exports = class SalesRepDao extends DaoBase {

	all(includeDeleted = false) {

		try {
			let query = "SELECT * FROM SalesRep "
			if (!includeDeleted)
				query += " WHERE Deleted=0"

			const retVal = this.db.prepare(query).all()
			return retVal

		}
		finally {
			if (this.mustClose)
				this.db.close()
		}
	}
}