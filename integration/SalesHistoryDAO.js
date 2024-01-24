const { allSizes } = require("../config/sizes.js");

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
			params.OrderNumber = "searchObject.OrderNumber"
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

}
