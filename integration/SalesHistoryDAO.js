const { auditColumns } = require("../sizes")


module.exports = class SalesHistoryDao {

	constructor(db) {
		this.db = db
	}

	insertSalesTotal(salesTotal) {
		
		let query = /*sql*/`
INSERT INTO SalesTotal
(${Object.keys(salesTotal).join(", ")})
VALUES
(${Object.keys(salesTotal).map(k => `@${k}`).join(", ")})`

		let statement = this.db.prepare(query)

		let info = statement.run(salesTotal)

		if (info.changes != 1)
			throw "error: insertSalesTotal, changes was not '1' "

	}

	insertSales(sales) {

		const keys = Object.keys(sales).filter(k => ! auditColumns.includes(k))

		let query = /*sql*/`
INSERT INTO Sales
(${keys.join(", ")})
VALUES
(${keys.map(k => `@${k}`).join(", ")})`

		let statement = this.db.prepare(query)

		let info = statement.run(sales)

		if (info.changes != 1)
			throw "error: insertSales, changes was not '1' "

	}


}