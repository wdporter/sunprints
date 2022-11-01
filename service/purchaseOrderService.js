const getDB = require("../integration/dbFactory")
const PurchaseOrderDao = require("../integration/PurchaseOrderDAO")


function getOutstanding() {
	const db = getDB()

	try {

		const dao = new PurchaseOrderDao(db)
		
		const purchaseOrders = dao.getOutstandingPurchaseOrders()

		// fix the date
		purchaseOrders.forEach(po => po.OrderDate = new Date(Date.parse(po.OrderDate)).toLocaleDateString(undefined, { dateStyle: "short" }))

		return purchaseOrders

	}
	catch(err) {
		console.log(err)
		throw err
	}
	finally {
		db.close()
	}
}



module.exports = { getOutstanding }