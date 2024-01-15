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

	updateSalesTotal(salesTotal) {
		let query = /*sql*/`UPDATE SalesTotal
		SET ${Object.keys(salesTotal).map(k => `${k}=@${k}`).join(", ")}
		WHERE OrderId=@OrderId`
		let statement = this.db.prepare(query)
		statement.run(salesTotal)
	}

	getCount() {
		const query = /*sql*/`SELECT COUNT(*) AS Count FROM SalesTotal`;
		const statement = this.db.prepare(query);
		const recordsTotal = statement.get().Count;

		return recordsTotal;
	}

}