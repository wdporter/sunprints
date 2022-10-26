const getDB = require("../integration/dbFactory")
const CustomerDao = require("../integration/CustomerDAO.js")


/**
 * Returns an array of customers. Matches when the term appears anywhere within Company or Code, case insensitive
 * @param {string} term the term to search with Company or Code fields
 * @returns {array} matching customers
 */
function search(term) {

	const db = getDB()
	const dao = new CustomerDao(db)
	const recordset = dao.search(term)

	const results = recordset.map(cust => {

		return {
			CustomerId: cust.CustomerId,
			Code: cust.Code,
			Company: cust.Company,
			detailsString: this.getDetailsString(cust)
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
	let detailsString = ""
	if (customer.Locality)
		detailsString += `, ${customer.Locality}`
	if (customer.State)
		detailsString += `, ${customer.State}`
	if (customer.Notes)
		detailsString += `; ${customer.Notes}`
	if (customer.DeliveryNotes)
		detailsString += `; ${customer.DeliveryNotes}`

	return detailsString

}


module.exports = { search, getDetailsString }