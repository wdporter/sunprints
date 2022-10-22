
const getDB = require("./dbFactory")

function get (orderId) {

	const db = getDB()
	
	let query = /*sql*/`SELECT 
	OrderId, CustomerId, OrderNumber, OrderDate, InvoiceDate, Repeat, New, BuyIn, Terms, SalesRep, Notes, Updated, DeliveryDate, CustomerOrderNumber, ProcessedDate, Done, Deleted, CreatedBy, CreatedDateTime, LastModifiedBy, LastModifiedDateTime 
	FROM Orders 
	WHERE OrderId = ?`

	const retVal = db.prepare(query).get(orderId)

	db.close()

	return retVal

}



module.exports = { get }