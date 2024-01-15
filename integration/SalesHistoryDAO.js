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
			where.push(`SalesTotal.SalesRep = @SalesRep`)
			params.SalesRep = searchObject.SalesRep.trimEnd(" (*)")
		}
		if (searchObject.Region !== "") {
			where.push(`SalesTotal.RegionId = @Region`)
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

}
