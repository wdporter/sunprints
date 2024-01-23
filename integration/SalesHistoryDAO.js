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

		const salesJoin = ` INNER JOIN Sales ON Sales.OrderId=SalesSearch_View.OrderId `
		let useSalesJoin = false

		const params = {}
		const where = []

		if (searchObject.Company != "") {
			where.push(` SalesSearch_View.CustomerId = @Company `)
			params.Company = searchObject.Company
		}
		if (searchObject.DateFrom !== "") {
			where.push(`OrderDate >= @DateFrom`)
			params.DateFrom = searchObject.DateFrom
		}
		if (searchObject.DateTo !== "") {
			where.push(`OrderDate <= @DateTo`)
			params.DateTo = searchObject.DateTo
		}
		if (searchObject.SalesRep !== "") {
			where.push(`SalesSearch_View.SalesRep = @SalesRep`)
			params.SalesRep = searchObject.SalesRep.trimEnd(" (*)")
		}
		if (searchObject.Region !== "") {
			where.push(`SalesSearch_View.RegionId = @Region`)
			params.Region = searchObject.Region.trimEnd(" (*)")
		}
		if (searchObject.Print != "") {
				where.push(`(Sales.FrontPrintDesignId=@Print OR Sales.BackPrintDesignId=@Print OR Sales.PocketPrintDesignId=@Print OR Sales.SleevePrintDesignId=@Print)`)
				params.Print = searchObject.Print
				useSalesJoin = true
		}
		if (searchObject.Screen !== "") {
			where.push(`(Sales.FrontScreenId=@Screen OR Sales.FrontScreen2Id=@Screen 
								OR Sales.BackScreenId=@Screen OR Sales.BackScreen2Id=@Screen 
								OR Sales.PocketScreenId=@Screen OR Sales.PocketScreen2Id=@Screen 
								OR Sales.SleeveScreenId=@Screen OR Sales.SleeveScreen2Id=@Screen 
								)`)
			params.Screen = searchObject.Screen
			useSalesJoin = true
		}
		if (searchObject.Embroidery !== "") {
			where.push(`(Sales.FrontEmbroideryDesignId=@Embroidery OR Sales.BackEmbroideryDesignId=@Embroidery OR Sales.PocketEmbroideryDesignId=@Embroidery OR Sales.SleeveEmbroideryDesignId=@Embroidery)`)
			params.Embroidery = searchObject.Embroidery
			useSalesJoin = true
		}
		if (searchObject.Usb !== "") {
			where.push(`(Sales.FrontUsbId=@Usb OR Sales.FrontUsb2Id=@Usb 
								OR Sales.BackUsbId=@Usb OR Sales.BackUsb2Id=@Usb 
								OR Sales.PocketUsbId=@Usb OR Sales.PocketUsb2Id=@Usb 
								OR Sales.SleeveUsbId=@Usb OR Sales.SleeveUsb2Id=@Usb 
								)`)
			params.Usb = searchObject.Usb
			useSalesJoin = true
		}
		if (searchObject.Transfer !== "") {
			where.push(`(Sales.FrontTransferDesignId =@Transfer 
								OR Sales.BackTransferDesignId  =@Transfer 
								OR Sales.PocketTransferDesignId=@Transfer 
								OR Sales.SleeveTransferDesignId=@Transfer)`)
			params.Transfer = searchObject.Transfer
			useSalesJoin = true
		}
		if (searchObject.TransferName !== "") {
			where.push(`(Sales.FrontTransferNameId =@TransferName OR Sales.FrontTransferName2Id =@TransferName 
								OR Sales.BackTransferNameId  =@TransferName OR Sales.BackTransferName2Id  =@TransferName 
								OR Sales.PocketTransferNameId=@TransferName OR Sales.PocketTransferName2Id=@TransferName 
								OR Sales.SleeveTransferNameId=@TransferName OR Sales.SleeveTransferName2Id=@TransferName 
								)`)
			params.TransferName = searchObject.TransferName
			useSalesJoin = true
		}
		if (searchObject.OrderNumber.trim() !== "") {
			where.push( ` OrderNumber LIKE @OrderNumber `)
			params.OrderNumber = `%${searchObject.OrderNumber}%`
		}


		let recordsFilteredQuery = `SELECT COUNT(*) AS Count FROM SalesSearch_View
		LEFT OUTER JOIN Customer ON Customer.CustomerId = SalesSearch_View.CustomerId  `
		if (useSalesJoin)
			recordsFilteredQuery += salesJoin
		if (where.length > 0) {
			recordsFilteredQuery += ` WHERE ${where.join(" AND ")} `
		}
		result.recordsFiltered = this.db.prepare(recordsFilteredQuery).get(params).Count

		if (useSalesJoin)
			query += salesJoin

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
