const getDB = require("../integration/dbFactory");
const SalesHistoryService = require("./SalesHistoryService.js");
const RegionService = require("./RegionService.js");
const SalesRepService = require("./SalesRepService.js");
const CustomerService = require("./CustomerService.js");
const PrintService = require("./PrintService.js");
const ScreenService = require("./ScreenService.js");
const EmbroideryService = require("./EmbroideryService.js");
const UsbService = require("./UsbService.js");
const TransferService = require("./TransferService.js");
const TransferNameService = require("./TransferNameService.js")

module.exports = class UnitOfWork
{
	constructor() {
		this.db = getDB();
	}

	/**
	 * user must always call this in order to close the connection
	 * if a transaction is active it will be rolled back, 
	 * so make sure you explicitly commit your transactions first
	 */
	close(doRollback = true) {
		if (this.db.inTransaction && doRollback) {
			this.rollback();
		}

		this.db.close();
	}

	begin() {
		if (!this.db.inTransaction) {
			this.db.prepare("BEGIN TRANSCATION").run();
		}

	}

	commit() {
		if (this.db.inTransaction) {
			this.db.prepare("COMMIT").run();
		}

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

	getSalesRepService() {
		if (typeof this.salesRepService === "undefined") {
			this.salesRepService = new SalesRepService(this.db);
		}
		return this.salesRepService;
	}

	getCustomerService() {
		if (typeof this.customerService === "undefined") {
			this.customerService = new CustomerService(this.db);
		}
		return this.customerService;
	}

	getPrintService() {
		if (typeof this.printService === "undefined") {
			this.printService = new PrintService(this.db);
		}
		return this.printService;
	}

	getScreenService() {
		if (typeof this.screenService === "undefined") {
			this.screenService = new ScreenService(this.db);
		}
		return this.screenService;
	}

	getEmbroideryService() {
		if (typeof this.embroideryService === "undefined") {
			this.embroideryService = new EmbroideryService(this.db);
		}
		return this.embroideryService;
	}

	getUsbService() {
		if (typeof this.usbService === "undefined") {
			this.usbService = new UsbService(this.db);
		}
		return this.usbService;
	}

	getTransferService() {
		if (typeof this.transferService === "undefined") {
			this.transferService = new TransferService(this.db);
		}
		return this.transferService;
	}

	getTransferNameService() {
		if (typeof this.transferNameService === "undefined") {
			this.transferNameService = new TransferNameService(this.db);
		}
		return this.transferNameService;
	}

}
