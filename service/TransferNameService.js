const TransferNameDao = require("../integration/TransferNameDAO.js");

/**
 * service methods to fetch transfername information
 */
class TransferNameService {

	constructor(db) {
		this.dao = new TransferNameDao(db);
	}
	
	getTransferNamesFromSalesHistory() {
		return this.dao.getTransferNamesFromSalesHistory();
	}

}

module.exports = TransferNameService;