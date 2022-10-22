const getDB = require("../integration/dbFactory")
const SalesRepDao = require("../integration/SalesRepDAO.js")

function getCurrentSalesRepNames () {

	const db = getDB()
	try {
		const dao = new SalesRepDao(db)
	
		return dao.all().map(sr => sr.Name)
	}
	finally {
		db.close()
	}
}


module.exports = { getCurrentSalesRepNames }