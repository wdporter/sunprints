const getDB = require("../integration/dbFactory")
const CustomerDao = require("../integration/CustomerDAO.js")
const RegionDao = require("../integration/RegionDAO.js")


/**
 * Returns an array of customers. Matches when the term appears anywhere within Company or Code, case insensitive
 * @param {int} id the customer id
 * @returns {array} the customer object all fields from table
 */
function get(id) {
	const db = getDB()
	const dao = new CustomerDao(db)

	return dao.get(id)

}



/**
 * Returns an array of customers. Matches when the term appears anywhere within Company or Code, case insensitive
 * @param {string} term the term to search with Company or Code fields
 * @returns {array} matching customers
 */
function search(term) {

	const db = getDB()

	const regionDao = new RegionDao(db)
	const regions = regionDao.all()

	const dao = new CustomerDao(db)
	const recordset = dao.search(term)

	const results = recordset.map(cust => {

		return {
			CustomerId: cust.CustomerId,
			Code: cust.Code,
			Company: cust.Company,
			RegionId: cust.RegionId,
			RegionName: regions.find(r => r.RegionId === cust.RegionId)?.Name ?? "",
			detailsString: this.getDetailsString(cust),
			SalesRep: cust.SalesRep
		}
	})

	return results

}

/**
 * Returns a string describing customer's state, locality and notes
 * @param {object} customer the customer object
 * @returns {string} a summary of details separated by commas and semi-colons
 */
function getDetailsString(customer) {
	const details = []
	if (customer.Locality)
		details.push(customer.Locality)
	if (customer.State)
		details.push(customer.State)
	if (customer.Notes)
		details.push(customer.Notes)
	if (customer.DeliveryNotes)
		details.push(customer.DeliveryNotes)

	return details.join("; ")

}


module.exports = { search, getDetailsString, get }