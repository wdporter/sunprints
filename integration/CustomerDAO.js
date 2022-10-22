const getDB = require("./dbFactory")
const { allSizes } = require("../config/sizes.js")


function get (customerId) {

	const db = getDB()

	const retVal = db.prepare("SELECT * FROM Customer WHERE CustomerId=?").get(customerId)

	db.close()

	return retVal


}

module.exports = { get }