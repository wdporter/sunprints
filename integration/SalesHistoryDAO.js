const { allSizes } = require("../config/sizes.js");
const { auditColumns } = require("../config/auditColumns.js");

module.exports = class SalesHistoryDao {

	constructor(db) {
		this.db = db;
	}


	getSearchResults(searchObject, sortBy, sortDirection, start, length) {

		const result = {};

		let query = /*sql*/`
		SELECT COUNT(*) AS Count 
		FROM SalesSearch_View`;
		let statement = this.db.prepare(query);
		result.recordsTotal = statement.get().Count;

		query = /*sql*/`SELECT * 
		FROM SalesSearch_View `

		const params = {}
		const where = []

		if (searchObject.Company != "") {
			where.push(" CustomerId = @Company ")
			params.Company = searchObject.Company
		}
		if (searchObject.OrderNumber.trim() !== "") {
			where.push( " OrderNumber = @OrderNumber ")
			params.OrderNumber = searchObject.OrderNumber
		}
		if (searchObject.Print != "") {
			where.push(" PrintDesignIds LIKE @Print ")
			params.Print = `%|${searchObject.Print}|%`
		}
		if (searchObject.Screen !== "") {
			where.push(" ScreenIds LIKE @Screen ")
			params.Screen = `%|${searchObject.Screen}|%`
		}
		if (searchObject.Embroidery !== "") {
			where.push(" EmbroideryDesignIds LIKE @Embroidery ")
			params.Embroidery = `%|${searchObject.Embroidery}|%`
		}
		if (searchObject.Usb !== "") {
			where.push(" UsbIds LIKE @Usb ")
			params.Usb = `%|${searchObject.Usb}|%`
		}
		if (searchObject.Transfer !== "") {
			where.push(" TransferDesignIds LIKE @Transfer ")
			params.Transfer = `%|${searchObject.Transfer}|%`
		}
		if (searchObject.TransferName !== "") {
			where.push(" TransferNameIds LIKE @TransferName ")
			params.TransferName = `%|${searchObject.TransferName}|%`
		}

		if (searchObject.DateFrom !== "") {
			where.push(" OrderDate >= @DateFrom ")
			params.DateFrom = searchObject.DateFrom
		}
		if (searchObject.DateTo !== "") {
			where.push(" OrderDate <= @DateTo ")
			params.DateTo = searchObject.DateTo
		}
		if (searchObject.SalesRep !== "") {
			where.push(" SalesSearch_View.SalesRep = @SalesRep ")
			params.SalesRep = searchObject.SalesRep.trimEnd(" (*)")
		}
		if (searchObject.Region !== "") {
			where.push(" SalesSearch_View.RegionId = @Region ")
			params.Region = searchObject.Region.trimEnd(" (*)")
		}

		let recordsFilteredQuery = `SELECT COUNT(*) AS Count FROM SalesSearch_View `
		if (where.length > 0) {
			recordsFilteredQuery += ` WHERE ${where.join(" AND ")} `
		}
		result.recordsFiltered = this.db.prepare(recordsFilteredQuery).get(params).Count


		query = /*sql*/`SELECT * FROM SalesSearch_View `;
		if (where.length > 0) 
			query += ` WHERE ${where.join(" AND ")} `

		query += ` ORDER BY `

		if (sortBy === "DateProcessed") { // processed date, show nulls first
				query += ` CASE WHEN DateProcessed IS NULL THEN 1 ELSE 0 END ${sortDirection}, DateProcessed ${sortDirection} `
		}
		else {
			query += ` ${sortBy} COLLATE NOCASE ${sortDirection} `
		}

		query += ` LIMIT ${length} OFFSET ${start}`

		result.data = this.db.prepare(query).all(params);

		return result;

	}

	getFilterTotals(customerid, fromdate, todate, regionid, salesrep) {

		var sql = /*sql*/`SELECT Price * (${allSizes.map(s=> `${s}`).join("+")}) AS Total FROM SalesTotal
		INNER JOIN Sales USING (OrderId) 
		WHERE `
	
		var whereClauses = [];
		var parameters = [];

		if (customerid !== "") {
			whereClauses.push(" SalesTotal.CustomerId = ?  ");
			parameters.push(customerid)
		}
		if (regionid !== "") {
			whereClauses.push(" SalesTotal.RegionId = ?  ");
			parameters.push(regionid)
		}
		if (salesrep !== "") {
			whereClauses.push(" SalesTotal.SalesRep = ?  ");
			parameters.push(salesrep)
		}
		if (fromdate !== "") {
			whereClauses.push( ` SalesTotal.OrderDate >= ? `)
			parameters.push(fromdate)
		}
		if (todate) {
			whereClauses.push( ` SalesTotal.OrderDate <= ? `)
			parameters.push(todate)
		}
		sql += whereClauses.join(" AND ");
	
		sql += " AND Sales.GarmentId NOT IN (11279, 16866, 24778, 25278) "
	
		const statement = this.db.prepare(sql);
		let resultset = statement.all(parameters)

		return resultset;

	}

	/**
	 * insert a new order into the SalesTotal tabel for sales history 
	 * 
	 * @param {*} order 
	 */
	insert(order) {
		const sql = /*sql*/`INSERT INTO SalesTotal
		(OrderId, OrderNumber, CustomerId, SalesRep, OrderDate, Repeat, New, BuyIn, Terms, Delivery, Notes, CustomerOrderNumber, StockOrderId, RegionId )
		VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`

		const statement = this.db.prepare(sql);
		statement.run(order.OrderId, order.OrderNumber, order.CustomerId, order.SalesRep, order.OrderDate, order.Repeat, order.New, order.BuyIn, order.Terms, order.DeliveryDate, order.Notes, order.CustomerOrderNumber, order.StockOrderId, order.RegionId);
	}

	/**
	 * insert a new product line into the Sales table for sales history
	 * 
	 * @param {*} product 
	 */
	insertOrderProduct(product) {
		const names = [];
		const values = [];

		for (let key in product) {
			if (auditColumns.includes(key))
				continue;
			names.push(key);
			values.push(product[key]);
		}

		let sql = /*sql*/`INSERT INTO Sales 
		(${names.join(",")} )
		VALUES(${names.map(n => "?").join(",")})`; // fortunately they are all numbers

		const statement = this.db.prepare(sql);
		const lastInsertRowid = statement.run(values);

	}

	/**
	 * update an order in the SalesTotal table for Sales History
	 * 
	 * @param {*} order 
	 */
	update(order) {
		const sql = /*sql*/`UPDATE SalesTotal
		SET OrderId=?,
		OrderNumber=?,
		CustomerId=?,
		SalesRep=?,
		OrderDate=?,
		Repeat=?,
		New=?,
		BuyIn=?,
		Terms=?,
		Delivery=?,
		Notes=?,
		CustomerOrderNumber=?,
		StockOrderId=?,
		RegionId=?,
		DateProcessed=?,
		DateInvoiced=?,
		Done=?
		WHERE OrderId=?`;
		const statement = this.db.prepare(sql);
		statement.run(order.OrderId, order.OrderNumber, order.CustomerId, order.SalesRep, order.OrderDate, order.Repeat, order.New, order.BuyIn, order.Terms, order.DeliveryDate, order.Notes, order.CustomerOrderNumber, order.StockOrderId, order.RegionId, order.ProcessedDate, order.InvoiceDate, order.Done, order.OrderId);
	}

	/**
	 * update a product line in the Sales table for Sales History
	 * 
	 * @param {*} product 
	 */
	updateOrderProduct(product) {
		var params = Object.keys(product).filter(p => !auditColumns.includes(p));

		const sql = /*sql*/`UPDATE Sales
		SET ${params.filter(p => p !== "OrderId").map(p => p + "=@" + p).join(",")}
		WHERE OrderId=@OrderId`;
		
		const statement = this.db.prepare(sql);
		statement.run(product);
	}

		/**
	 * delete a product line from the Sales table for sales history
	 * @param {*} product 
	 */
		deleteOrderProduct(product)
		{
			const sql = /*sql*/`DELETE FROM Sales WHERE OrderGarmentId=?`;
			const statement = this.db.prepare(sql);
			statement.run(product.OrderGarmentId);
		}

}
