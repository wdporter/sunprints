const getDB = require("./dbFactory")

module.exports = class DaoBase {

	constructor(db) {
		if (db) {
			this.mustClose = false
			this.db = db
		}
		else {
			this.mustClose = true
			this.db = getDB()
		}
	}


}