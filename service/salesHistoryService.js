const SalesHistoryDao = require("../integration/SalesHistoryDAO.js");
const { auditColumns } = require("../config/auditColumns.js");
const getDB = require("../integration/dbFactory");

/**
 * 
 * @param {Database} db  a Database connection because this is probably part of a transaction
 * @param {object} order the order that gets inserted into the SalesTotal table
 */
function insertOrder (db, order) {

	const dao = new SalesHistoryDao(db)
	
	// there are variations in the column names, so fix those
	// note: update also fixes InvoiceDate→DateInvoiced, but new items are always null for this one (same is true for processed date)
	let keys = Object.keys(order).filter(k => ! auditColumns.includes(k))
	const salesTotal = {}
	Object.keys(order).forEach (k => {
		if (auditColumns.includes(k))
			return // ignore audit columns

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



/**
 * For the given order, updates the corresponding sales history table item
 * 
 * @param {Database} db  a Database connection because this is probably part of a transaction
 * @param {object} order the order that gets updated in the SalesTotal table
 */
function updateOrder (db, order) {

	const dao = new SalesHistoryDao(db)
	
	// there are variations in the column names, so fix those
	let keys = Object.keys(order).filter(k => ! auditColumns.includes(k))
	const salesTotal = {}
	Object.keys(order).forEach (k => {
		if (auditColumns.includes(k))
			return // ignore audit columns
		if (k == "Deleted")
			return // ignore, does not exist in SalesTotal

		if (k == "DeliveryDate") {
			salesTotal.Delivery = order[k] // DeliveryDate becomes Delivery
		}
		else if (k == "InvoiceDate") {
			salesTotal.DateInvoiced = order[k] // InvoiceDate becomes DateInvoiced (this is not needed on the inserts)
		}
		else if (k == "ProcessedDate") {
			salesTotal.DateProcessed = order[k]
		}
		else 
			salesTotal[k] = order[k]
	})

	dao.updateSalesTotal(salesTotal)


}

/**
 * gets the count of records in the sales history table
 * 
 * @param {Database} db 
 * @return {Array} the list of items 
 */
function getCount() 
{
	const db = getDB()
	const dao = new SalesHistoryDao(db)
	return dao.getCount()
}




module.exports = { insertOrder, insertProduct, updateOrder, getCount }