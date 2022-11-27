const { allSizes } = require("../config/sizes.js")

module.exports = class PurchaseOrderProductDAO {

	constructor(db) {
		this.db = db
	}

	getPurchaseOrderProducts(stockOrderId) {

		try {
			return this.db.prepare(
			/*sql*/`
			SELECT *
			FROM StockOrderGarment
			WHERE StockOrderId = ?`
			).all(stockOrderId)
		}
		catch (ex) {
			console.log(ex)
			throw ex
		}
	}
}