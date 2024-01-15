const getDB = require("../integration/dbFactory")
const RegionDao = require("../integration/RegionDAO")

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

/* creates a new region */
function create(name, order, user) {
	
	const db = getDB()
	const dao = new RegionDao(db)

	try {
		dao.create(name, order, user)
	}
	finally {
		db.close()
	}
}

function update(id, name, order, active, user) {
	const db = getDB()
	const dao = new RegionDao(db)

	try {
		dao.update(id, name, order, active, user)
	}
	finally {
		db.close()
	}


}

module.exports = { all, create, update }