const TransferDao = require("../integration/TransferDAO.js");

/**
 * service methods to fetch transfer information
 */
class TransferService {

	constructor(db) {
		this.dao = new TransferDao(db);
	}
	
	getTransfersFromSalesHistory() {
		return this.dao.getTransfersFromSalesHistory();
	}


}

module.exports = TransferService;