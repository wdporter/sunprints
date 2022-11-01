const AuditLogDao = require("./AuditLogDAO.js")

module.exports = class OrderDao {

	constructor(db) {
		this.db = db
	}


	/**
	 * returns the order with the given id
	 * @param {number} orderId 
	 * @returns the order straight from order table
	 */
	get(orderId) {

		let query = /*sql*/`SELECT 
		OrderId, CustomerId, OrderNumber, OrderDate, InvoiceDate, Repeat, New, BuyIn, Terms, SalesRep, Notes, Updated, DeliveryDate, CustomerOrderNumber, ProcessedDate, Done, Deleted, StockOrderId, CreatedBy, CreatedDateTime, LastModifiedBy, LastModifiedDateTime 
		FROM Orders 
		WHERE OrderId = ?`

		const retVal = this.db.prepare(query).get(orderId)
		return retVal
	}


	/**
	 * Gets the order by order number, or null if it doesn't exist
	 * @param {string} orderNumber 
	 * @return the order, or null if not found
	 */
	getByOrderNumber(orderNumber) {
		return this.db.prepare(`SELECT  * FROM Orders WHERE OrderNumber = ?`).get(orderNumber)
	}


/**
 * 
 * @param {object} order the order that will be saved
 * @returns {object} an order object, that has propeties removed that weren't saved
 */
	insert(order) {

		const info = this.db.prepare("PRAGMA table_info(Orders)").all()
		const cols = info.map(i => i.name)

		const itemToSave = {}
		for (let key in order) {
			if (cols.includes(key))
				itemToSave[key] = order[key]
		}

		try {
			let query = /*sql*/`
INSERT INTO Orders ( ${Object.keys(itemToSave).join(" , ")} )
VALUES (${Object.keys(itemToSave).map(k => `@${k}`).join(" , ")})
`
			let statement = this.db.prepare(query)
			let info = statement.run(itemToSave)
			console.log("insert orders", info)

			itemToSave.OrderId = info.lastInsertRowid

			const auditLogDao = new AuditLogDao(this.db)
			auditLogDao.insert("Orders", "OrderId", itemToSave)


			return itemToSave
		}
		catch(ex) {
			console.log("error", ex)
			throw ex
		}
	}






}
