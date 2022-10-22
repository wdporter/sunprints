const getDB = require("../integration/dbFactory")
const CustomerDao = require("../integration/CustomerDAO.js")


/**
 * Returns an array of customers. Matches when the term appears anywhere within Company or Code, case insensitive
 *
 * @param {String} term the term to search with Company or Code fields
 * @returns {Array} matching customers
 */
function search(term) {

	const dao = new CustomerDao()
	const recordset = dao.search(term)

	const results = recordset.map(cust => {
		return {
			CustomerId: cust.CustomerId,
			Code: cust.Code,
			Company: cust.Company,
			Locality: cust.Locality,
			State: cust.State,
			DeliveryNotes: cust.DeliveryNotes,
			Notes: cust.Notes
		}
	})


	return results

}


module.exports = { search }