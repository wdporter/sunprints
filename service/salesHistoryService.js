//const getDB = require("../integration/dbFactory")
const SalesHistoryDao = require("../integration/SalesHistoryDAO.js")
const { auditColumns } = require("../config/auditColumns.js")

/**
 * 
 * @param {Database} db  a Database connection because this is probably part of a transaction
 * @param {object} order the order that gets inserted
 */
function insertOrder (db, order) {

	const dao = new SalesHistoryDao(db)
	
	//there are variations in the column names, so fix those
	// note: update also fixes InvoiceDate→DateInvoiced, but new items are always null for this one
	let keys = Object.keys(order).filter(k => ! auditColumns.includes(k))
	const salesTotal = {}
	Object.keys(order).forEach (k => {
		if (auditColumns.includes(k))
			return // ignore audit columns
		if (k == "StockOrderId")
			return // ignore

		if (k == "DeliveryDate") {
			salesTotal.Delivery = order[k] // DeliveryDate becomes Delivery
		}
		else 
			salesTotal[k] = order[k]
	})

	dao.insertSalesTotal(salesTotal)


}

/**
 * 
 * @param {Database} Db a Database connection because this is probably part of a transaction
 * @param {object} product a product to insert 
 */
function insertProduct(db, product,) {

	const dao = new SalesHistoryDao(db)
	dao.insertSales (product)


}



module.exports = { insertOrder, insertProduct }