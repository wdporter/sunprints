



module.exports = class PurchaseOrderDao {

	/**
	 * Create the Purchase Order Data Access Object
	 * @constructor
	 * @param {object} db a db object created by dbFactory, supports "get", "all" and "run"
	 */
	constructor(db) {
		this.db = db
	}

	/**
	 * used by the new order page
	 * 
	 * returns all purchase orders not yet received
	 * @todo filter out any that already feature in a buy in that is, the new stock order id field on the orders table 
	 * @returns {array} purchase orders not yet received
	 */
	 getOutstandingPurchaseOrders() {
		const retVal =  this.db.prepare("SELECT StockOrderId, OrderDate, Company FROM StockOrder INNER JOIN Supplier USING (SupplierId) WHERE ReceiveDate IS NULL ").all()

		return retVal

	}


}