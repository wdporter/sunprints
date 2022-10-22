
const SalesRepDAO = require("../integration/SalesRepDAO.js")

function getCurrentSalesRepNames () {
	return SalesRepDAO.all().map(sr => sr.Name)
}


module.exports = { getCurrentSalesRepNames }