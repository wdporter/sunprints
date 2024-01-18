const UsbDao = require("../integration/UsbDAO.js");

/**
 * service methods to fetch usb information
 */
class UsbService {

	constructor(db) {
		this.dao = new UsbDao(db);
	}
	
	getUsbsFromSalesHistory() {
		return this.dao.getUsbsFromSalesHistory();
	}

}

module.exports = UsbService;