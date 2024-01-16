const PrintDao = require("../integration/PrintDAO.js");

/**
 * service methods to fetch print information
 */
class PrintService {

	constructor(db) {
		this.dao = new PrintDao(db);
	}
	
	getPrintsFromSalesHistory() {
		return this.dao.getPrintsFromSalesHistory();
	}

	getAll() {
		return this.dao.all().map(r => {return { id: r.PrintId, name: r.Name }});
	}


}



module.exports = PrintService;