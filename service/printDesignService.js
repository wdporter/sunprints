const getDB = require("../integration/dbFactory")
const PrintDao = require("../integration/PrintDAO")


/**
 * Returns the standard (unnamed) screens for a print design
 * @param {int} id the id of the print design
 * @returns {array} an array of names, each name is a string, an empty array if none found
 */

function standardScreens(id) {

	const db = getDB()
	const dao = new PrintDao(db)

	const result = dao.getStandardScreens(id)

	const ret = result.map(s => s.Name.trimEnd() )

	return ret;



}


module.exports = { standardScreens }