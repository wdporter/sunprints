module.exports = class OrderDao {

	constructor(db) {
		this.db = db
	}



	get(orderId) {

		let query = /*sql*/`SELECT 
		OrderId, CustomerId, OrderNumber, OrderDate, InvoiceDate, Repeat, New, BuyIn, Terms, SalesRep, Notes, Updated, DeliveryDate, CustomerOrderNumber, ProcessedDate, Done, Deleted, StockOrderId, CreatedBy, CreatedDateTime, LastModifiedBy, LastModifiedDateTime 
		FROM Orders 
		WHERE OrderId = ?`

		const retVal = this.db.prepare(query).get(orderId)
		return retVal
	}

}
