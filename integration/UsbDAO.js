class UsbDao {

	constructor(db) {
		this.db = db
	}

	/**
	 * 
	 * @returns list of usbs
	 */
	getUsbsFromSalesHistory() {
		const usbs = this.db.prepare(/*sql*/`SELECT * FROM Usb 
		WHERE UsbId IN (
			SELECT FrontUsbId FROM Sales 
			UNION SELECT FrontUsb2Id FROM Sales 
			UNION SELECT BackUsbId FROM Sales 
			UNION SELECT BackUsb2Id FROM Sales 
			UNION SELECT SleeveUsbId FROM Sales
			UNION SELECT SleeveUsb2Id FROM Sales
			UNION SELECT PocketUsbId FROM Sales
			UNION SELECT PocketUsb2Id FROM Sales
		)
		ORDER BY Number COLLATE NOCASE`).all();

		return usbs;

	}

}

module.exports = UsbDao
