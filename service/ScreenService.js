const ScreenDao = require("../integration/ScreenDAO.js");

/**
 * service methods to fetch screen information
 */
class ScreenService {

	constructor(db) {
		this.dao = new ScreenDao(db);
	}
	
	getScreensFromSalesHistory() {
		return this.dao.getScreensFromSalesHistory();
	}

	getAll() {
		return this.dao.all().map(s => {return { 
			id: s.ScreenId, 
			name: `${s.Number} ${s.Colour} ${s.Name}` 
		}});
	}

}

module.exports = ScreenService;