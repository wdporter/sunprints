const CustomerDao = require("../integration/CustomerDAO.js");


/**
 * service methods to fetch customer information
 */
class CustomerService {

	constructor(db) {
		this.dao = new CustomerDao(db);
	}
	
	getSalesHistoryCustomers() {
		
		const customers = this.dao.getSalesHistoryCustomers();
		
		return customers.map(c => {
			return {
				value: c.CustomerId,
				name: `${c.Company} (${c.Code})`
			}
		})
	}
}



module.exports = CustomerService;