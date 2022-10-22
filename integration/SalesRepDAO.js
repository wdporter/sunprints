const getDB = require("./dbFactory.js");


function all (deleted=false) {

	const db = getDB()
	
	let query = "SELECT * FROM SalesRep "
	if (!deleted)
		query += " WHERE Deleted=0"

	const retVal = db.prepare(query).all()

	db.close()

	return retVal

}

module.exports = { all }