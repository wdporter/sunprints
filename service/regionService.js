const RegionDao = require("../integration/RegionDAO.js");

/**
 * service methods to fetch region information
 */
class RegionService {

	constructor(db) {
		this.dao = new RegionDao(db);
	}
	
	getNames() {
		return this.dao.all().map(r => {return { id: r.RegionId, name: r.Name }});
	}

	getAll() {
		return this.dao.all().map(r => {return { id: r.RegionId, name: r.Name }});
	}
	
}

module.exports = RegionService;