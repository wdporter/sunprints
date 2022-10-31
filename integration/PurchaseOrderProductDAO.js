const { allSizes } = require("../config/sizes.js")

module.exports = class PurchaseOrderProductDAO {

	constructor(db) {
		this.db = db
	}

	getPurchaseOrderProducts(stockOrderId) {

		try {
			return this.db.prepare(
			/*sql*/`
			SELECT StockOrderGarment.GarmentId,  
			${allSizes.map(sz => `StockOrderGarment.${sz}`).join()},
			Code, Label, Type, Colour, SizeCategory, Notes AS GarmentNotes
			FROM StockOrderGarment
			INNER JOIN Garment USING (GarmentId)
			WHERE StockOrderId = ?`
			).all(stockOrderId)
		}
		catch (ex) {
			console.log(ex)
			throw ex
		}
	}
}