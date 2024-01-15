const SalesRepDao = require("../integration/SalesRepDAO.js");

/**
 * service methods to fetch region information
 */
class SalesRepService {

	constructor(db) {
		this.dao = new SalesRepDao(db);
	}
	
	getNames() {
		return this.dao.all(true).map(s => {return { Name: s.Name, Deleted: s.Deleted }});
	}

}



module.exports = SalesRepService;