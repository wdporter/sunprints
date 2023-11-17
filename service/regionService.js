const getDB = require("../integration/dbFactory")
const RegionDao = require("../integration/RegionDao")

/**
 * Returns an array of regions, included deleted
 *
 * @returns {array} regions
 */
function all() {

	const db = getDB()
	const dao = new RegionDao(db)

	try {
		const result = dao.all(true)

		result.sort((a, b) => a.Order - b.Order)

		return result
	}
	finally {
		db.close()
	}
}


module.exports = { all }