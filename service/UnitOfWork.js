const getDB = require("../integration/dbFactory");
const SalesHistoryService = require("./SalesHistoryService.js");
const RegionService = require("./RegionService.js");

module.exports = class UnitOfWork
{
	constructor() {
		this.db = getDB();
	}

	/**
	 * user must always call this in order to close the connection
	 */
	close() {
		if (this.db.inTransaction) {
			this.commit();
		}

		this.db.close();
	}

	begin() {

	}

	commit() {
		this.db.prepare("COMMIT").run();

	}

	rollback() {
		if (this.db.inTransaction) {
			this.db.rollback();
		}

	}
	
	getSalesHistoryService() {
		if (typeof this.salesHistoryService === "undefined") {
			this.salesHistoryService = new SalesHistoryService(this.db);
		}
		return this.salesHistoryService;
	}

	getRegionService() {
		if (typeof this.regionService === "undefined") {
			this.regionService = new RegionService(this.db);
		}
		return this.regionService;
	}

}
