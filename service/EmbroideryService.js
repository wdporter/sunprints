const EmbroideryDao = require("../integration/EmbroideryDAO.js");

/**
 * service methods to fetch embroidery information
 */
class EmbroideryService {

	constructor(db) {
		this.dao = new EmbroideryDao(db);
	}
	
	getEmbroideriesFromSalesHistory() {
		return this.dao.getEmbroideriesFromSalesHistory();
	}

	getAll() {
		return this.dao.all();
	}

}

module.exports = EmbroideryService;