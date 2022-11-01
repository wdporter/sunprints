const AuditLogDao = require("./AuditLogDAO.js")

module.exports = class OrderProductDao {

	constructor(db) {
		this.db = db
	}


	insert(product) {
		

		try {
			let query = /*sql*/`
INSERT INTO OrderGarment ( ${Object.keys(product).join(" , ")} )
VALUES (${Object.keys(product).map(k => `@${k}`).join(" , ")})`
			let statement = this.db.prepare(query)
			let info = statement.run(product)
			console.log("insert product", info)
			
			product.OrderGarmentId = info.lastInsertRowid

			new AuditLogDao(this.db).insert("OrderGarment", "OrderGarmentId", product)

			return product.OrderGarmentId

		}
		catch(ex) {
			console.log("error", ex)
			throw ex
		}

	}



}