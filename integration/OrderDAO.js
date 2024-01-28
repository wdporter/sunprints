const AuditLogDao = require("./AuditLogDAO.js")

module.exports = class OrderDao {

	constructor(db) {
		this.db = db
	}


	/**
	 * returns the order with the given id
	 * @param {number} orderId 
	 * @returns all fields in the order table
	 */
	get(orderId) {

		let query = /*sql*/`SELECT 
		OrderId, CustomerId, OrderNumber, OrderDate, InvoiceDate, Repeat, New, BuyIn, Terms, SalesRep, Notes, DeliveryDate, CustomerOrderNumber, ProcessedDate, Done, Deleted, StockOrderId, CreatedBy, CreatedDateTime, LastModifiedBy, LastModifiedDateTime, RegionId 
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
 * inserts an order into the Orders table
 * @param {object} order the order that will be saved
 * @returns {object} an order object, that has propeties removed that weren't saved
 */
	insert(order) {

		// get an array of the column names of the orders table
		const info = this.db.prepare("PRAGMA table_info(Orders)").all()
		const cols = info.map(i => i.name)

		// only keep properties of our order object that are actually in the table
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

	/**
	 * updates an order into the Orders table
	 * @param {object} order the order that will be saved
	 * @param {string} user the user name for LastModifiedBy
	 * @returns {object} the updated order object that is fetched from the database. If there are no changes, it is null
	 */
	update(order, user) {
	
		// the order object can have extra properties, so get the columns from the database
		const info = this.db.prepare("PRAGMA table_info(Orders)").all()
		const ignoreCols = ["Updated", "Company", "Freight", "InvoiceNumber"]
		const cols = info.filter(i => !ignoreCols.includes(i.name)).map(i => i.name)

		// get the existing order
		const existing = this.db.prepare("SELECT * FROM Orders WHERE OrderId=?").get(order.OrderId)
		if (existing == null) {
			throw new Error("We can't find the order id. Contact the developers")
		}

		// only update columns that have actually changed
		const changed = []
		cols.forEach(c => {
			if (existing[c] !== order[c])
				changed.push(c)
		})

		let newObj = null // return null if there are no changes
		if (changed.length > 0) {
			const now = new Date().toLocaleString()
			order.LastModifiedBy = user
			order.LastModifiedDateTime = now
			changed.push("LastModifiedBy")
			changed.push("LastModifiedDateTime")
	
			// update the database, note that there is an UPDATE trigger on this table for SalesTotal
			let statement = 
			/*sql*/`UPDATE Orders 
			SET ${changed.map(c => `${c}=@${c}`).join(" , ")} 
			WHERE OrderId=@OrderId`
			this.db.prepare(statement).run(order)

			// audit log, fetch again the updated object, and send old and new
			newObj = this.db.prepare("SELECT * FROM Orders WHERE OrderId=?").get(order.OrderId)
			const auditLogDao = new AuditLogDao(this.db)
			auditLogDao.update("Orders", "OrderId", existing, newObj)

		}

		return newObj

	}




}
