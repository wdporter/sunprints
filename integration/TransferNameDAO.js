class TransferNameDao {

	constructor(db) {
		this.db = db
	}

	/**
	 * 
	 * @returns list of transfernames
	 */
	getTransferNamesFromSalesHistory() {
		const transfernames = this.db.prepare(/*sql*/`SELECT * FROM TransferName 
		WHERE TransferNameId IN (
			SELECT FrontTransferNameId FROM Sales 
			UNION SELECT FrontTransferName2Id FROM Sales 
			UNION SELECT BackTransferNameId FROM Sales 
			UNION SELECT BackTransferName2Id FROM Sales 
			UNION SELECT SleeveTransferNameId FROM Sales
			UNION SELECT SleeveTransferName2Id FROM Sales
			UNION SELECT PocketTransferNameId FROM Sales
			UNION SELECT PocketTransferName2Id FROM Sales
		)
		ORDER BY Name COLLATE NOCASE`).all();

		return transfernames;

	}

}

module.exports = TransferNameDao
