
const DaoBase = require("./dao_base.js")

module.exports = class OrderDao extends DaoBase {

	constructor(db) {
		if (db) {
			super(db)
		}
	}

	get(orderId) {

		try {
			let query = /*sql*/`SELECT 
		OrderId, CustomerId, OrderNumber, OrderDate, InvoiceDate, Repeat, New, BuyIn, Terms, SalesRep, Notes, Updated, DeliveryDate, CustomerOrderNumber, ProcessedDate, Done, Deleted, CreatedBy, CreatedDateTime, LastModifiedBy, LastModifiedDateTime 
		FROM Orders 
		WHERE OrderId = ?`

			const retVal = this.db.prepare(query).get(orderId)
			return retVal
		}
		finally {
			if (this.mustClose)
				this.db.close()
		}
	}

}

