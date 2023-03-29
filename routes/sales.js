const express = require("express")
const router = express.Router()

const Database = require("better-sqlite3");
const sz = require("../sizes.js")

/* GET Sales History page. */
router.get("/", (req, res) => {

		res.render("sales.ejs", {
			title: "Sales History",
			user: req.auth.user,
			poweruser: res.locals.poweruser,
			stylesheets: ["/stylesheets/buttons.dataTables-2.2.3.css", "/stylesheets/sales-theme.css"],
			javascripts:  ["/javascripts/dataTables.buttons-2.2.3.js"]
		})
})



// GET datatable ajax for sales history table
router.get("/dt", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	try {
console.log(req.query.customSearch)
		let query = `SELECT COUNT(*) AS Count FROM SalesTotal`
		let statement = db.prepare(query)
		let recordsTotal = recordsFiltered = statement.all().reduce((acc, curr) => { return acc + curr.Count}, 0)


		query = /*sql*/`SELECT SalesTotal.OrderId, SalesTotal.OrderNumber, SalesTotal.OrderDate, SalesTotal.SalesRep, SalesTotal.DateProcessed, 
		SalesTotal.Delivery, Customer.Code, Customer.Company, Customer.CustomerId, SalesTotal.Terms, SalesTotal.BuyIn, SalesTotal.Notes, SalesTotal.Done
		,SalesTotal.StockOrderId
		FROM SalesTotal 
		LEFT OUTER JOIN Customer ON Customer.CustomerId = SalesTotal.CustomerId `
		
		const salesJoin = ` INNER JOIN Sales ON Sales.OrderId=SalesTotal.OrderId `
		let useSalesJoin = false

		const params = {}
		const where = []
		if (req.query.customSearch) {
			if (req.query.customSearch.Company && req.query.customSearch.Company != "0") {
				where.push(` SalesTotal.CustomerId = @Company `)
				params.Company = req.query.customSearch.Company
			}
			if (req.query.customSearch.Code && req.query.customSearch.Code != "0") {
				where.push(` SalesTotal.CustomerId = @Code `)
				params.Code = req.query.customSearch.Code
			}
			if (req.query.customSearch.DateFrom) {
				where.push(`OrderDate >= @DateFrom`)
				params.DateFrom = req.query.customSearch.DateFrom
			}
			if (req.query.customSearch.DateTo) {
				where.push(`OrderDate <= @DateTo`)
				params.DateTo = req.query.customSearch.DateTo
			}
			if (req.query.customSearch.SalesRep && req.query.customSearch.SalesRep != "0") {
				where.push(`SalesTotal.SalesRep = @SalesRep`)
				params.SalesRep = req.query.customSearch.SalesRep.trimEnd(" (*)")
			}
			if (req.query.customSearch.Print && req.query.customSearch.Print != "0") {
					where.push(`(Sales.FrontPrintDesignId=@Print OR Sales.BackPrintDesignId=@Print OR Sales.PocketPrintDesignId=@Print OR Sales.SleevePrintDesignId=@Print)`)
					params.Print = req.query.customSearch.Print
					useSalesJoin = true
			}
			if (req.query.customSearch.Screen && req.query.customSearch.Screen != "0") {
				where.push(`(Sales.FrontScreenId=@Screen OR Sales.FrontScreen2Id=@Screen 
									OR Sales.BackScreenId=@Screen OR Sales.BackScreen2Id=@Screen 
									OR Sales.PocketScreenId=@Screen OR Sales.PocketScreen2Id=@Screen 
									OR Sales.SleeveScreenId=@Screen OR Sales.SleeveScreen2Id=@Screen 
									)`)
				params.Screen = req.query.customSearch.Screen
				useSalesJoin = true
			}
			if (req.query.customSearch.Embroidery && req.query.customSearch.Embroidery != "0") {
				where.push(`(Sales.FrontEmbroideryDesignId=@Embroidery OR Sales.BackEmbroideryDesignId=@Embroidery OR Sales.PocketEmbroideryDesignId=@Embroidery OR Sales.SleeveEmbroideryDesignId=@Embroidery)`)
				params.Embroidery = req.query.customSearch.Embroidery
				useSalesJoin = true
			}
			if (req.query.customSearch.Usb && req.query.customSearch.Usb != "0") {
				where.push(`(Sales.FrontUsbId=@Usb OR Sales.FrontUsb2Id=@Usb 
									OR Sales.BackUsbId=@Usb OR Sales.BackUsb2Id=@Usb 
									OR Sales.PocketUsbId=@Usb OR Sales.PocketUsb2Id=@Usb 
									OR Sales.SleeveUsbId=@Usb OR Sales.SleeveUsb2Id=@Usb 
									)`)
				params.Usb = req.query.customSearch.Usb
				useSalesJoin = true
			}
			if (req.query.customSearch.Transfer && req.query.customSearch.Transfer != "0") {
				where.push(`(Sales.FrontTransferDesignId =@Transfer 
									OR Sales.BackTransferDesignId  =@Transfer 
									OR Sales.PocketTransferDesignId=@Transfer 
									OR Sales.SleeveTransferDesignId=@Transfer)`)
				params.Transfer = req.query.customSearch.Transfer
				useSalesJoin = true
			}
			if (req.query.customSearch.TransferName && req.query.customSearch.TransferName != "0") {
				where.push(`(Sales.FrontTransferNameId =@TransferName OR Sales.FrontTransferName2Id =@TransferName 
									OR Sales.BackTransferNameId  =@TransferName OR Sales.BackTransferName2Id  =@TransferName 
									OR Sales.PocketTransferNameId=@TransferName OR Sales.PocketTransferName2Id=@TransferName 
									OR Sales.SleeveTransferNameId=@TransferName OR Sales.SleeveTransferName2Id=@TransferName 
									)`)
				params.TransferName = req.query.customSearch.TransferName
				useSalesJoin = true
			}
			if (req.query.customSearch.OrderNumber.trim()) {
				where.push( ` OrderNumber LIKE @OrderNumber `)
				params.OrderNumber = `%${req.query.customSearch.OrderNumber}%`
			}


			let recordsFilteredQuery = `SELECT COUNT(*) AS Count FROM SalesTotal
			LEFT OUTER JOIN Customer ON Customer.CustomerId = SalesTotal.CustomerId  `
			if (useSalesJoin)
				recordsFilteredQuery += salesJoin
			if (where.length > 0) {
				recordsFilteredQuery += ` WHERE ${where.join(" AND ")} `
			}
			recordsFiltered = db.prepare(recordsFilteredQuery).get(params).Count

		}

		if (useSalesJoin)
			query += salesJoin

		if (where.length > 0) 
			query += ` WHERE ${where.join(" AND ")} `


		if (req.query.order) {
			query += " ORDER BY "
			query += req.query.order.map(o => `${Number(o.column) } COLLATE NOCASE ${o.dir}` ).join(", ")
		}

		query += ` LIMIT ${req.query.length} OFFSET ${req.query.start}`

		data = db.prepare(query).all(params)

		// now we have to get the designs used for each sale
		const query2 = db.prepare(/*sql*/`SELECT 
		fpd.Code || ' ' || fpd.Notes AS FrontPrintDesign
		,bpd.Code || ' ' || bpd.Notes AS BackPrintDesign 
		,ppd.Code || ' ' || ppd.Notes AS PocketPrintDesign
		,spd.Code || ' ' || spd.Notes AS SleevePrintDesign 
		,fed.Code || ' ' || fed.Notes AS FrontEmbroideryDesign
		,bed.Code || ' ' || bed.Notes AS BackEmbroideryDesign 
		,ped.Code || ' ' || ped.Notes AS PocketEmbroideryDesign
		,sed.Code || ' ' || sed.Notes AS SleeveEmbroideryDesign 
		,ftd.Code || ' ' || ftd.Notes AS FrontTransferDesign
		,btd.Code || ' ' || btd.Notes AS BackTransferDesign 
		,ptd.Code || ' ' || ptd.Notes AS PocketTransferDesign
		,std.Code || ' ' || std.Notes AS SleeveTransferDesign 
		FROM Sales
		LEFT OUTER JOIN PrintDesign fpd ON fpd.PrintDesignId=Sales.FrontPrintDesignId
		LEFT OUTER JOIN PrintDesign bpd ON bpd.PrintDesignId=Sales.BackPrintDesignId
		LEFT OUTER JOIN PrintDesign ppd ON ppd.PrintDesignId=Sales.PocketPrintDesignId
		LEFT OUTER JOIN PrintDesign spd ON spd.PrintDesignId=Sales.SleevePrintDesignId
		LEFT OUTER JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId=Sales.FrontEmbroideryDesignId
		LEFT OUTER JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId=Sales.BackEmbroideryDesignId
		LEFT OUTER JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=Sales.PocketEmbroideryDesignId
		LEFT OUTER JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=Sales.SleeveEmbroideryDesignId
		LEFT OUTER JOIN TransferDesign ftd ON ftd.TransferDesignId=Sales.FrontTransferDesignId
		LEFT OUTER JOIN TransferDesign btd ON btd.TransferDesignId=Sales.BackTransferDesignId
		LEFT OUTER JOIN TransferDesign ptd ON ptd.TransferDesignId=Sales.PocketTransferDesignId
		LEFT OUTER JOIN TransferDesign std ON std.TransferDesignId=Sales.SleeveTransferDesignId
		WHERE 
		OrderId=?
		AND NOT (FrontPrintDesign IS NULL AND BackPrintDesign IS NULL AND PocketPrintDesign IS NULL AND SleevePrintDesign IS NULL
		AND FrontEmbroideryDesign IS NULL AND BackEmbroideryDesign IS NULL AND PocketEmbroideryDesign IS NULL AND SleeveEmbroideryDesign IS NULL
		AND FrontTransferDesign IS NULL AND BackTransferDesign IS NULL AND PocketTransferDesign IS NULL AND SleeveTransferDesign IS NULL)
		`)
		data.forEach(d => {
			const designs = query2.all(d.OrderId)
			d.designItems = []
			designs.forEach(design => {
				Object.keys(design).forEach(k => {
					if (design[k]) 
						d.designItems.push(design[k])
				})
			})
		})

		res.send({
			data,
			recordsTotal,
			recordsFiltered,
			draw: Number(req.query.draw),
		}).end()


	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
		res.render("error.ejs", { message: ex.message, error: { status: ex.name, stack: null } }).end()
		console.log(ex)

	}
	finally {
		db.close()
	}



})


router.get("/customernames", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const customers = db.prepare("SELECT Customer.CustomerId, Customer.Company, Code FROM Customer INNER JOIN SalesTotal ON SalesTotal.CustomerId=Customer.CustomerId GROUP BY Customer.CustomerId ORDER BY 2 COLLATE NOCASE").all()
		res.send(
			customers.map(c => {
				return {
					value: c.CustomerId,
					name: `${c.Company} (${c.Code})`
				}
			})
		)
	}
	finally{
		db.close()
	}
})


router.get("/customercodes", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const customers = db.prepare("SELECT Customer.CustomerId, Customer.Company, Code FROM Customer INNER JOIN SalesTotal ON SalesTotal.CustomerId=Customer.CustomerId GROUP BY Customer.CustomerId ORDER BY 3 COLLATE NOCASE").all()

		customers.sort(function(a, b) {
			if (!isNaN(a.Code) && !isNaN(b.Code) ) {
				return Number(a.Code) - Number(b.Code) 
			}
			if (!isNaN(a.Code) && isNaN(b.Code) ) {
				return Number(a.Code.split(" ")[0])  -  Number(b.Code)
			}
			if (isNaN(a.Code) && !isNaN(b.Code) ) {
				return Number(a.Code.split(" ")[0]) - Number(b.Code)
			}
			
			if (isNaN(a.Code) && isNaN(b.Code) )
			{
				let aparts = a.Code.split(" ")
				let bparts = b.Code.split(" ")
				aparts[0] = Number(aparts[0])
				bparts[0] = Number(bparts[0])
				if (aparts[0] != bparts[0])
					return aparts[0] - bparts[0]
				
				a2 = Number(aparts[1].replace(/\(|\)/g, ""))
				b2 = Number(bparts[1].replace(/\(|\)/g, ""))
				return a2 - b2
			}
		})

		res.send(
			customers.map(c => {
				return {
					value: c.CustomerId,
					name: `${c.Code} — ${c.Company}`
				}
			})
		)
	}
	catch(err) {
		console.log (err.message)
	}
	finally{
		db.close()
	}
})

router.get("/salesreps", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const reps = db.prepare("SELECT Name, Deleted FROM SalesRep WHERE Name IN (SELECT Distinct(SalesRep) FROM SalesTotal) ORDER BY 2, 1 ").all()
		res.send(
			reps.map(r => {
				return {
					value: r.Name,
					name: r.Name + (r.Deleted == 1 ? "*" : "")
				}
			})
		)
	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		db.close()
	}
})

router.get("/prints", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const prints = db.prepare(`SELECT PrintDesignId, Code || ' | ' || IFNULL(Notes, '') AS CodeNotes FROM PrintDesign 
		WHERE PrintDesignId IN 
			(SELECT FrontPrintDesignId FROM Sales UNION SELECT BackPrintDesignId FROM Sales UNION SELECT PocketPrintDesignId FROM Sales UNION SELECT SleevePrintDesignId FROM Sales) 
		ORDER BY 2`).all()
		res.send(
			prints.map(p => {
				return {
					value: p.PrintDesignId,
					name: p.CodeNotes
				}
			})
		)
	}
	finally{
		db.close()
	}
})

router.get("/screens", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const screens = db.prepare(`SELECT ScreenId, Number, Colour, Name FROM Screen 
		WHERE ScreenId IN (
			SELECT FrontScreenId FROM Sales 
			UNION SELECT FrontScreen2Id FROM Sales 
			UNION SELECT BackScreenId FROM Sales 
			UNION SELECT BackScreen2Id FROM Sales 
			UNION SELECT SleeveScreenId FROM Sales
			UNION SELECT SleeveScreen2Id FROM Sales
			UNION SELECT PocketScreenId FROM Sales
			UNION SELECT PocketScreen2Id FROM Sales
		)
		ORDER BY 2 COLLATE NOCASE`).all()
		res.send(
			screens.map(s => {
				return {
					value: s.ScreenId,
					name: `${s.Number} ${s.Colour} ${s.Name}`
				}
			})
		)
	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		db.close()
	}
})


router.get("/embroideries", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const embroideries = db.prepare(`SELECT EmbroideryDesignId, Code || ' | ' || Notes AS CodeNotes FROM EmbroideryDesign 
		WHERE EmbroideryDesignId IN (
			SELECT FrontEmbroideryDesignId FROM Sales 
			UNION SELECT BackEmbroideryDesignId FROM Sales 
			UNION SELECT PocketEmbroideryDesignId FROM Sales 
			UNION SELECT SleeveEmbroideryDesignId FROM Sales) 
		ORDER BY 2 COLLATE NOCASE`).all()
		res.send(
			embroideries.map(e => {
				return {
					value: e.EmbroideryDesignId,
					name: e.CodeNotes
				}
			})
		)
	}
	finally{
		db.close()
	}
})


router.get("/usbs", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const usbs = db.prepare(`SELECT UsbId, Number || ' | ' || IFNULL(Notes, '') AS NumberNotes FROM Usb 
		WHERE UsbId IN (
			SELECT FrontUsbId FROM Sales 
			UNION SELECT FrontUsb2Id FROM Sales 
			UNION SELECT BackUsbId FROM Sales 
			UNION SELECT BackUsb2Id FROM Sales 
			UNION SELECT SleeveUsbId FROM Sales
			UNION SELECT SleeveUsb2Id FROM Sales
			UNION SELECT PocketUsbId FROM Sales
			UNION SELECT PocketUsb2Id FROM Sales)
		ORDER BY 2 COLLATE NOCASE`).all()
		res.send(
			usbs.map(u => {
				return {
					value: u.UsbId,
					name: u.NumberNotes
				}
			})
		)
	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		db.close()
	}
})

router.get("/transfers", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const transfers = db.prepare(`SELECT TransferDesignId, Code || ' | ' || IFNULL(Notes, '') AS CodeNotes FROM TransferDesign 
		WHERE TransferDesignId IN (
			SELECT FrontTransferDesignId FROM Sales 
			UNION SELECT BackTransferDesignId FROM Sales 
			UNION SELECT PocketTransferDesignId FROM Sales 
			UNION SELECT SleeveTransferDesignId FROM Sales) 
		ORDER BY 2 COLLATE NOCASE`).all()
		res.send(
			transfers.map(t => {
				return {
					value: t.TransferDesignId,
					name: t.CodeNotes
				}
			})
		)
	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		db.close()
	}
})


router.get("/transfernames", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	try {
		const names = db.prepare(`SELECT TransferNameId, IFNULL(Name, 'no name') AS Name 
		FROM TransferName
		WHERE TransferNameId IN (
			SELECT FrontTransferNameId FROM Sales 
			UNION SELECT FrontTransferName2Id FROM Sales 
			UNION SELECT BackTransferNameId FROM Sales 
			UNION SELECT BackTransferName2Id FROM Sales 
			UNION SELECT SleeveTransferNameId FROM Sales
			UNION SELECT SleeveTransferName2Id FROM Sales
			UNION SELECT PocketTransferNameId FROM Sales
			UNION SELECT PocketTransferName2Id FROM Sales)
		 ORDER BY 2 COLLATE NOCASE`).all()
		res.send(
			names.map(n => {
				return {
					value: n.TransferNameId,
					name: n.Name
				}
			})
		)
	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		db.close()
	}
})


router.get("/:orderid/history", (req, res) => {

	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	try {
		let query = /*sql*/`SELECT 
		 Garment.Code || ' ' || Garment.Type AS Product
		,Garment.Colour || ' ' || Garment.Label  AS Product2 
		,fpd.Code || ' | ' || fpd.Notes AS FrontPrintDesign
		,bpd.Code || ' | ' || bpd.Notes AS BackPrintDesign
		,ppd.Code || ' | ' || ppd.Notes AS PocketPrintDesign
		,spd.Code || ' | ' || spd.Notes AS SleevePrintDesign
		,fs.Number || ' | ' || fs.Colour || ' | ' || fs.Name AS FrontScreen
		,fs2.Number || ' | ' || fs2.Colour || ' | ' || fs2.Name AS FrontScreen2
		,bs.Number || ' | ' || bs.Colour || ' | ' || bs.Name AS BackScreen
		,bs2.Number || ' | ' || bs2.Colour || ' | ' || bs2.Name AS BackScreen2
		,ps.Number || ' | ' || ps.Colour || ' | ' || ps.Name AS PocketScreen
		,ps2.Number || ' | ' || ps2.Colour || ' | ' || ps2.Name AS PocketScreen2
		,ss.Number || ' | ' || ss.Colour || ' | ' || ss.Name AS SleeveScreen
		,ss2.Number || ' | ' || ss2.Colour || ' | ' || ss2.Name AS SleeveScreen2
		,fed.Code || ' | ' || fed.Notes AS FrontEmbroideryDesign
		,bed.Code || ' | ' || bed.Notes AS BackEmbroideryDesign
		,ped.Code || ' | ' || ped.Notes AS PocketEmbroideryDesign
		,sed.Code || ' | ' || sed.Notes AS SleeveEmbroideryDesign
		,fu.Number || ' | ' || fu.Notes AS FrontUsb
		,fu2.Number || ' | ' || fu2.Notes AS FrontUsb2
		,bu.Number || ' | ' || bu.Notes AS BackUsb
		,bu2.Number || ' | ' || bu2.Notes AS BackUsb2
		,pu.Number || ' | ' || pu.Notes AS PocketUsb
		,pu2.Number || ' | ' || pu2.Notes AS PocketUsb2
		,su.Number || ' | ' || su.Notes AS SleeveUsb
		,su2.Number || ' | ' || su2.Notes AS SleeveUsb2
		,ftd.Code || ' | ' || ftd.Notes AS FrontTransferDesign
		,btd.Code || ' | ' || btd.Notes AS BackTransferDesign
		,ptd.Code || ' | ' || ptd.Notes AS PocketTransferDesign
		,std.Code || ' | ' || std.Notes AS SleeveTransferDesign
		,fn.Name AS FrontTransferName
		,fn2.Name AS FrontTransferName2
		,bn.Name AS BackTransferName
		,bn2.Name AS BackTransferName2
		,pn.Name AS PocketTransferName
		,pn2.Name AS PocketTransferName2
		,sn.Name AS SleeveTransferName
		,sn2.Name AS SleeveTransferName2
		,Price
		,${sz.allSizes.map(s => `Sales.${s}`).join(", ")}
		,${sz.allSizes.map(s=> `Sales.${s}`).join("+")} AS Total
		,'$' || printf('%.2f', (${sz.allSizes.map(s => `Sales.${s}`).join(" + ")}) * Price) AS Value
		FROM Sales 
			INNER JOIN Garment ON Garment.GarmentId=Sales.GarmentId
			LEFT OUTER JOIN PrintDesign fpd ON fpd.PrintDesignId=Sales.FrontPrintDesignId
			LEFT OUTER JOIN PrintDesign bpd ON bpd.PrintDesignId=Sales.BackPrintDesignId
			LEFT OUTER JOIN PrintDesign ppd ON ppd.PrintDesignId=Sales.PocketPrintDesignId
			LEFT OUTER JOIN PrintDesign spd ON spd.PrintDesignId=Sales.SleevePrintDesignId
			LEFT OUTER JOIN Screen fs ON fs.ScreenId=Sales.FrontScreenId
			LEFT OUTER JOIN Screen fs2 ON fs2.ScreenId=Sales.FrontScreen2Id
			LEFT OUTER JOIN Screen bs ON bs.ScreenId=Sales.BackScreenId
			LEFT OUTER JOIN Screen bs2 ON bs2.ScreenId=Sales.BackScreen2Id
			LEFT OUTER JOIN Screen ps ON ps.ScreenId=Sales.PocketScreenId
			LEFT OUTER JOIN Screen ps2 ON ps2.ScreenId=Sales.PocketScreen2Id
			LEFT OUTER JOIN Screen ss ON ss.ScreenId=Sales.SleeveScreenId
			LEFT OUTER JOIN Screen ss2 ON ss2.ScreenId=Sales.SleeveScreen2Id
			LEFT OUTER JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId=Sales.FrontEmbroideryDesignId
			LEFT OUTER JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId=Sales.BackEmbroideryDesignId
			LEFT OUTER JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=Sales.PocketEmbroideryDesignId
			LEFT OUTER JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=Sales.SleeveEmbroideryDesignId
			LEFT OUTER JOIN Usb fu ON fu.UsbId=Sales.FrontUsbId
			LEFT OUTER JOIN Usb fu2 ON fu2.UsbId=Sales.FrontUsb2Id
			LEFT OUTER JOIN Usb bu ON bu.UsbId=Sales.BackUsbId
			LEFT OUTER JOIN Usb bu2 ON bu2.UsbId=Sales.BackUsb2Id
			LEFT OUTER JOIN Usb pu ON pu.UsbId=Sales.PocketUsbId
			LEFT OUTER JOIN Usb pu2 ON pu2.UsbId=Sales.PocketUsb2Id
			LEFT OUTER JOIN Usb su ON su.UsbId=Sales.SleeveUsbId
			LEFT OUTER JOIN Usb su2 ON su2.UsbId=Sales.SleeveUsb2Id
			LEFT OUTER JOIN TransferDesign ftd ON ftd.TransferDesignId=Sales.FrontTransferDesignId
			LEFT OUTER JOIN TransferDesign btd ON btd.TransferDesignId=Sales.BackTransferDesignId
			LEFT OUTER JOIN TransferDesign ptd ON ptd.TransferDesignId=Sales.PocketTransferDesignId
			LEFT OUTER JOIN TransferDesign std ON std.TransferDesignId=Sales.SleeveTransferDesignId
			LEFT OUTER JOIN TransferName fn ON fn.TransferNameId=Sales.FrontTransferNameId
			LEFT OUTER JOIN TransferName fn2 ON fn2.TransferNameId=Sales.FrontTransferName2Id
			LEFT OUTER JOIN TransferName bn ON bn.TransferNameId=Sales.BackTransferNameId
			LEFT OUTER JOIN TransferName bn2 ON bn2.TransferNameId=Sales.BackTransferName2Id
			LEFT OUTER JOIN TransferName pn ON pn.TransferNameId=Sales.PocketTransferNameId
			LEFT OUTER JOIN TransferName pn2 ON pn2.TransferNameId=Sales.PocketTransferName2Id
			LEFT OUTER JOIN TransferName sn ON sn.TransferNameId=Sales.SleeveTransferNameId
			LEFT OUTER JOIN TransferName sn2 ON sn2.TransferNameId=Sales.SleeveTransferName2Id
			WHERE OrderId=?`
		let sales = db.prepare(query).all(req.params.orderid)

		// sales = sales.map(s => {
		// 	return {
		// 		Garment: s.Garment
		// 	}
		// } )

		res.send(sales)

	}
	catch(ex) {
		console.log(ex)
		res.statusMessage = ex.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}


})

router.get("/csv/", (req, res) => {

	if (!req.query.datefrom || !req.query.dateto) {
		res.statusMessage("missing date parameters")
		res.sendStatus(400)
	}

	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	try {
		let query = /*sql*/`SELECT SalesTotal.OrderNumber, Customer.Company, SalesTotal.SalesRep, SalesTotal.OrderDate,
		Garment.Code || ' ' || Type || ' ' || Colour AS Product,
		${sz.allSizes.map(sz => `Sales.${sz}`).join("+")} AS Qty,
		Price,
		(${sz.allSizes.map(sz => `Sales.${sz}`).join("+")}) * Price AS Value
		FROM SalesTotal
		INNER JOIN Customer ON SalesTotal.CustomerId=Customer.CustomerId
		LEFT JOIN Sales ON SalesTotal.OrderId=Sales.OrderId
		LEFT JOIN Garment ON Sales.GarmentId=Garment.GarmentId
		WHERE SalesTotal.OrderDate >= ? AND SalesTotal.OrderDate <= ?
		`
	
		let statement = db.prepare(query)
		let results = statement.all(req.query.datefrom, req.query.dateto)

		const lines = [Object.keys(results[0]).join(",")]
		const data = results.map(r => {
			const values = Object.keys(r).map(k => `"${r[k]}"` )
			lines.push(values.join(","))
		})
		
		let csv = lines.join("\n")
		csv = csv.replace(/\"null\"/g, "")
	
		res.header("Content-Type", "text/csv")
		res.attachment(`sales_${req.query.datefrom}_to_${req.query.dateto}.csv`);
		res.send(csv)

	}
	catch(err) {
		res.statusMessage = err.message
		res.sendStatus(400)

	}
	finally {
		db.close()
	}


})


// GET edit page for a sales history item
router.get("/edit/:id", (req, res) => {

	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	try {

		let query = /*sql*/`SELECT 
		SalesTotal.rowid, SalesTotal.OrderId, SalesTotal.OrderNumber, SalesTotal.CustomerId, SalesTotal.SalesRep, SalesTotal.OrderDate, SalesTotal.Repeat, SalesTotal.New, SalesTotal.BuyIn, SalesTotal.Terms, SalesTotal.Delivery,SalesTotal.Notes, SalesTotal.CustomerOrderNumber, SalesTotal.DateProcessed, SalesTotal.DateInvoiced, 	
		Sales.rowid AS salesrowid, Sales.GarmentId, Sales.OrderGarmentId, Sales.Price, 
		Garment.Code, Label, Type, Garment.Colour, Garment.SizeCategory, Garment.Notes AS GarmentNotes, Garment.Deleted,
		${sz.allSizes.map(s => `Sales.${s}`).join(",")},
		fpd.PrintDesignId AS FrontPrintDesignId,
		IFNULL(fpd.Code, '') || ' ' || IFNULL(fpd.Notes, '') || ' ' || IFNULL(fpd.Comments, '') AS FrontPrintDesignName,
		bpd.PrintDesignId AS BackPrintDesignId,
		IFNULL(bpd.Code, '') || ' ' || IFNULL(bpd.Notes, '') || ' ' || IFNULL(bpd.Comments, '') AS BackPrintDesignName,
		ppd.PrintDesignId AS PocketPrintDesignId,
		IFNULL(ppd.Code, '') || ' ' || IFNULL(ppd.Notes, '') || ' ' || IFNULL(ppd.Comments, '') AS PocketPrintDesignName,
		spd.PrintDesignId AS SleevePrintDesignId,
		IFNULL(spd.Code, '') || ' ' || IFNULL(spd.Notes, '') || ' ' || IFNULL(spd.Comments, '') AS SleevePrintDesignName,
		fed.EmbroideryDesignId AS FrontEmbroideryDesignId,
		IFNULL(fed.Code, '') || ' ' || IFNULL(fed.Notes, '') || ' ' || IFNULL(fed.Comments, '') AS FrontEmbroideryDesignName,
		bed.EmbroideryDesignId AS BackEmbroideryDesignId,
		IFNULL(bed.Code, '') || ' ' || IFNULL(bed.Notes, '') || ' ' || IFNULL(bed.Comments, '') AS BackEmbroideryDesignName,
		ped.EmbroideryDesignId AS PocketEmbroideryDesignId,
		IFNULL(ped.Code, '') || ' ' || IFNULL(ped.Notes, '') || ' ' || IFNULL(ped.Comments, '') AS PocketEmbroideryDesignName,
		sed.EmbroideryDesignId AS SleeveEmbroideryDesignId,
		IFNULL(sed.Code, '') || ' ' || IFNULL(sed.Notes, '') || ' ' || IFNULL(sed.Comments, '') AS SleeveEmbroideryDesignName,
		ftd.TransferDesignId AS FrontTransferDesignId,
		IFNULL(ftd.Code, '') || ' ' || IFNULL(ftd.Notes, '') AS FrontTransferDesignName,
		btd.TransferDesignId AS BackTransferDesignId,
		IFNULL(btd.Code, '') || ' ' || IFNULL(btd.Notes, '') AS BackTransferDesignName,
		ptd.TransferDesignId AS PocketTransferDesignId,
		IFNULL(ptd.Code, '') || ' ' || IFNULL(btd.Notes, '') AS PocketTransferDesignName,
		std.TransferDesignId AS SleeveTransferDesignId,
		IFNULL(std.Code, '') || ' ' || IFNULL(std.Notes, '') AS SleeveTransferDesignName,
		fs1.ScreenId AS FrontScreen1Id,
		IFNULL(fs1.Name, '(standard)') || ' ' || IFNULL(fs1.Number, '') || ' ' || IFNULL(fs1.Colour, '') AS FrontScreen1Name,
		fs2.ScreenId AS FrontScreen2Id,
		IFNULL(fs2.Name, '(standard)') || ' ' || IFNULL(fs2.Number, '') || ' ' || IFNULL(fs2.Colour, '') AS FrontScreen2Name,
		bs1.ScreenId AS BackScreen1Id,
		IFNULL(bs1.Name, '(standard)') || ' ' || IFNULL(bs1.Number, '') || ' ' || IFNULL(bs1.Colour, '') AS BackScreen1Name,
		bs2.ScreenId AS BackScreen2Id,
		IFNULL(bs2.Name, '(standard)') || ' ' || IFNULL(bs2.Number, '') || ' ' || IFNULL(bs2.Colour, '') AS BackScreen2Name,
		ps1.ScreenId AS PocketScreen1Id,
		IFNULL(ps1.Name, '(standard)') || ' ' || IFNULL(ps1.Number, '') || ' ' || IFNULL(ps1.Colour, '') AS PocketScreen1Name,
		ps2.ScreenId AS PocketScreen2Id,
		IFNULL(ps2.Name, '(standard)') || ' ' || IFNULL(ps2.Number, '') || ' ' || IFNULL(ps2.Colour, '') AS PocketScreen2Name,
		ss1.ScreenId AS SleeveScreen1Id,
		IFNULL(ss1.Name, '(standard)') || ' ' || IFNULL(ss1.Number, '') || ' ' || IFNULL(ss1.Colour, '') AS SleeveScreen1Name,
		ss2.ScreenId AS SleeveScreen2Id,
		IFNULL(ss2.Name, '(standard)') || ' ' || IFNULL(ss2.Number, '') || ' ' || IFNULL(ss2.Colour, '') AS PocketScreen2Name,
		fu1.UsbId AS FrontUsb1Id,
		IFNULL(fu1.Number, '') || ' ' || IFNULL(fu1.Notes, '') AS FrontUsb1Name,
		fu2.UsbId AS FrontUsb2Id,
		IFNULL(fu2.Number, '') || ' ' || IFNULL(fu2.Notes, '') AS FrontUsb2Name,
		bu1.UsbId AS BackUsb1Id,
		IFNULL(bu1.Number, '') || ' ' || IFNULL(bu1.Notes, '') AS BackUsb1Name,
		bu2.UsbId AS BackUsb2Id,
		IFNULL(bu2.Number, '') || ' ' || IFNULL(bu2.Notes, '') AS BackUsb2Name,
		pu1.UsbId AS PocketUsb1Id,
		IFNULL(pu1.Number, '') || ' ' || IFNULL(pu1.Notes, '') AS PocketUsb1Name,
		pu2.UsbId AS PocketUsb2Id,
		IFNULL(pu2.Number, '') || ' ' || IFNULL(pu2.Notes, '') AS PocketUsb2Name,
		su1.UsbId AS SleeveUsb1Id,
		IFNULL(su1.Number, '') || ' ' || IFNULL(su1.Notes, '') AS SleeveUsb1Name,
		su2.UsbId AS SleeveUsb2Id,
		IFNULL(su2.Number, '') || ' ' || IFNULL(su2.Notes, '') AS SleeveUsb2Name,
		ftn1.TransferNameId AS FrontTransferName1Id,
		ftn1.Name AS FrontTransferName1Name,
		ftn2.TransferNameId AS FrontTransferName2Id,
		ftn2.Name AS FrontTransferName2Name,
		btn1.TransferNameId AS BackTransferName1Id,
		btn1.Name AS BackTransferName1Name,
		btn2.TransferNameId AS BackTransferName2Id,
		btn2.Name AS BackTransferName2Name,
		ptn1.TransferNameId AS PocketTransferName1Id,
		ptn1.Name AS PocketTransferName1Name,
		ptn2.TransferNameId AS PocketTransferName2Id,
		ptn2.Name AS PocketTransferName2Name,
		stn1.TransferNameId AS SleeveTransferName1Id,
		stn1.Name AS SleeveTransferName1Name,
		stn2.TransferNameId AS SleeveTransferName2Id,
		stn2.Name AS SleeveTransferName2Name
		FROM SalesTotal 
		LEFT JOIN Sales ON Sales.OrderId=SalesTotal.OrderId 
		LEFT JOIN Garment ON Sales.GarmentId=Garment.GarmentId
		LEFT JOIN PrintDesign fpd ON fpd.PrintDesignId=Sales.FrontPrintDesignId
		LEFT JOIN PrintDesign bpd ON bpd.PrintDesignId=Sales.BackPrintDesignId
		LEFT JOIN PrintDesign ppd ON ppd.PrintDesignId=Sales.PocketPrintDesignId
		LEFT JOIN PrintDesign spd ON spd.PrintDesignId=Sales.SleevePrintDesignId
		LEFT JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId=Sales.FrontEmbroideryDesignId
		LEFT JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId=Sales.BackEmbroideryDesignId
		LEFT JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=Sales.PocketEmbroideryDesignId
		LEFT JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=Sales.SleeveEmbroideryDesignId
		LEFT JOIN TransferDesign ftd ON ftd.TransferDesignId=Sales.FrontTransferDesignId
		LEFT JOIN TransferDesign btd ON btd.TransferDesignId=Sales.BackTransferDesignId
		LEFT JOIN TransferDesign ptd ON ptd.TransferDesignId=Sales.PocketTransferDesignId
		LEFT JOIN TransferDesign std ON std.TransferDesignId=Sales.SleeveTransferDesignId
		LEFT JOIN Screen fs1 ON fs1.ScreenId=Sales.FrontScreenId
		LEFT JOIN Screen fs2 ON fs2.ScreenId=Sales.FrontScreen2Id
		LEFT JOIN Screen bs1 ON bs1.ScreenId=Sales.BackScreenId
		LEFT JOIN Screen bs2 ON bs2.ScreenId=Sales.BackScreen2Id
		LEFT JOIN Screen ps1 ON ps1.ScreenId=Sales.PocketScreenId
		LEFT JOIN Screen ps2 ON ps2.ScreenId=Sales.PocketScreen2Id
		LEFT JOIN Screen ss1 ON ss1.ScreenId=Sales.SleeveScreenId
		LEFT JOIN Screen ss2 ON ss2.ScreenId=Sales.SleeveScreen2Id
		LEFT JOIN Usb fu1 ON fu1.UsbId=Sales.FrontUsbId
		LEFT JOIN Usb fu2 ON fu2.UsbId=Sales.FrontUsb2Id
		LEFT JOIN Usb bu1 ON bu1.UsbId=Sales.BackUsbId
		LEFT JOIN Usb bu2 ON bu2.UsbId=Sales.BackUsb2Id
		LEFT JOIN Usb pu1 ON pu1.UsbId=Sales.PocketUsbId
		LEFT JOIN Usb pu2 ON pu2.UsbId=Sales.PocketUsb2Id
		LEFT JOIN Usb su1 ON su1.UsbId=Sales.SleeveUsbId
		LEFT JOIN Usb su2 ON su2.UsbId=Sales.SleeveUsb2Id
		LEFT JOIN TransferName ftn1 ON ftn1.TransferNameId=Sales.FrontTransferName2Id
		LEFT JOIN TransferName ftn2 ON ftn2.TransferNameId=Sales.FrontTransferName2Id
		LEFT JOIN TransferName btn1 ON btn1.TransferNameId=Sales.BackTransferNameId
		LEFT JOIN TransferName btn2 ON btn2.TransferNameId=Sales.BackTransferName2Id
		LEFT JOIN TransferName ptn1 ON ptn1.TransferNameId=Sales.PocketTransferNameId
		LEFT JOIN TransferName ptn2 ON ptn2.TransferNameId=Sales.PocketTransferName2Id
		LEFT JOIN TransferName stn1 ON stn1.TransferNameId=Sales.SleeveTransferNameId
		LEFT JOIN TransferName stn2 ON stn2.TransferNameId=Sales.SleeveTransferName2Id
		WHERE SalesTotal.OrderId=?`
		
		// we have an array, so we need to consolidate into one
		const orderDetails = db.prepare(query).all(req.params.id)

		const order = {
			rowid: orderDetails[0].rowid,
			OrderId: orderDetails[0].OrderId,
			OrderNumber: orderDetails[0].OrderNumber, 
			CustomerId: orderDetails[0].CustomerId, 
			SalesRep: orderDetails[0].SalesRep, 
			OrderDate: orderDetails[0].OrderDate, 
			Repeat: orderDetails[0].Repeat, 
			New: orderDetails[0].New, 
			BuyIn: orderDetails[0].BuyIn, 
			Terms: orderDetails[0].Terms, 
			Delivery: orderDetails[0].Delivery, 
			Notes: orderDetails[0].Notes, 
			CustomerOrderNumber: orderDetails[0].CustomerOrderNumber, 
			DateProcessed: orderDetails[0].DateProcessed, 
			DateInvoiced: orderDetails[0].DateInvoiced,
			Products: []
		}
		orderDetails.forEach(od => {
			const product = {
				salesrowid: od.salesrowid,
				GarmentId: od.GarmentId,
				Deleted: od.Deleted,
				Code: od.Code,
				Label: od.Label,
				Type: od.Type,
				Colour: od.Colour,
				Notes: od.GarmentNotes,
				SizeCategory: od.SizeCategory,
				Price: od.Price?.toFixed(2) ?? null,
				removed: false,
				added: false,
			}

			sz.allSizes.forEach(size => {
				product[size] = od[size]
			})

			sz.locations.forEach(loc => {
				sz.decorations.forEach(dec => {
					product[`${loc}${dec}DesignId`] = od[`${loc}${dec}DesignId`]
					product[`${loc}${dec}DesignName`] = od[`${loc}${dec}DesignName`]
				})

				sz.media.forEach(m => {
					product[`${loc}${m}1Id`] = od[`${loc}${m}1Id`]
					product[`${loc}${m}1Name`] = od[`${loc}${m}1Name`]
					product[`${loc}${m}2Id`] = od[`${loc}${m}2Id`]
					product[`${loc}${m}2Name`] = od[`${loc}${m}2Name`]
				})
			})

			sz.locations.forEach(loc => {
				if (product[`${loc}Screen1Name`] == "(standard)  ")
					product[`${loc}Screen1Name`] = null
				if (product[`${loc}Screen2Name`] == "(standard)  ")
					product[`${loc}Screen2Name`] = null
			})

			order.Products.push(product)
		})

		const customers = db.prepare("SELECT CustomerId, Company || CASE WHEN Deleted=1 THEN ' (deleted)' ELSE '' END AS Company  FROM Customer ORDER BY Company").all()
		const salesReps = db.prepare("SELECT Name || CASE WHEN Deleted=1 THEN ' (deleted)' ELSE '' END AS Name FROM SalesRep ORDER BY Deleted, Name").all().map(sr => sr.Name)


		res.render("sales_edit.ejs", {
			title: "Edit Sales History",
			user: req.auth.user,
			order,
			customers,
			salesReps,
			allSizes: sz.allSizes,
			sizes: sz.sizes	
		})

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
		res.render("error.ejs", { message: ex.message, error: { status: ex.name, stack: null } })

	}
	finally {
		db.close()
	}


})


router.get("/productsearch", (req, res) => {

	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	try {

		let query = `SELECT Count(*) AS Count  
		FROM Garment 
		WHERE ${Object.keys(req.query).map(k => ` ${k} LIKE ? `).join(" AND ")}`
		const params = Object.keys(req.query).map(k => `%${req.query[k]}%`)
		const count = db.prepare(query).get(params).Count

		query = query.replace("Count(*) AS Count", " GarmentId, Code, Label, Type, Colour, Notes, SizeCategory ")
		query += " LIMIT 50"

		const results = db.prepare(query).all(params)

		res.send({
			count: count,
			limit: 50,
			data: results
		})



	}
	catch(err) {
		console.log(`Error: ${err}`)
		res.statusMessage = err.message
		res.sendStatus(400)
	}
	finally {
		db.close()
	}
})

// GET all candidate media types for the given Decoration 
//  example /sales/mediasearch?media=Usb&location=Front&decoration=Embroidery&design=n
router.get("/mediasearch", (req, res) => {

	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	const { media, location, decoration, design} = req.query

	try {

		if (! sz.decorations.includes(decoration))
			throw new Error ("bad decoration")
		if (! sz.media.includes(media))
			throw new Error ("bad medium")
		if (! sz.locations.includes(location))
			throw new Error ("bad location")

		const mediaColumns = {
			Screen: ["Screen.ScreenId AS Id", "Name", "Number", "Colour" ],
			Usb: ["Usb.UsbId  AS Id", "Number", "Notes"],
			TransferName: ["TransferName.TransferNameId  AS Id", "Name"]
		}

		let query = /*sql*/`SELECT ${mediaColumns[req.query.media].join(", ")}, SizeCategory
	FROM ${media}
	INNER JOIN 
		${media}${decoration}Design 
			ON ${media}${decoration}Design.${media}Id = ${media}.${media}Id
	WHERE ${decoration}DesignId=?
		AND ${media}${decoration}Design.${location}=1
		`

		if (media == "Screen") {
			query += " AND NOT Name IS NULL "
		}

		const data = db.prepare(query).all(design)

		res.send({
			data
		})

	}
	catch(err) {
		console.log(`Error: ${err}`)
		res.statusMessage = err.message
		res.sendStatus(400)
	}
	finally {
		db.close()
}})



// GET all candidate designs for the given location
// this one is used when a design is selected, to test if the media selected relate to this design
//  example /sales/designsearch?location=Front&decoration=Embroidery&Code=asdf&Notes=abc&Comments=asdf
router.get("/designsearch", (req, res) => {

	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	const { location, decoration } = req.query

	const cols = ["Code", "Notes", "Comments"]
	if (decoration == "TransferName")
		close.pop()

	const media = sz.media[sz.decorations.indexOf(decoration)]

	try {

		const joinTable = `${media}${req.query.decoration}Design`

		let query = /*sql*/`SELECT ${decoration}Design.*, SizeCategory 
FROM ${joinTable}
INNER JOIN 
${decoration}Design ON ${decoration}Design.${decoration}DesignId = ${joinTable}.${decoration}DesignId
WHERE ${joinTable}.${location}=1
AND `
		// find which columns have search values
		let whereClauses = []
		let whereParams = []
		cols.forEach(col => {
			if (req.query[col]) {
				whereClauses.push(`${col} LIKE ? `)
				whereParams.push(`%${req.query[col]}%`)
			}
		})
		query += ` ${whereClauses.join(" AND ")} `
		query += /*sql*/` GROUP BY (${decoration}Design.${decoration}DesignId) 
		ORDER BY 2 `

		const data = db.prepare(query).all(whereParams)

		const LIMIT = 50
		res.send({
			count: data.length,
			limit: LIMIT,
			data: data.slice(0, LIMIT)
		})

	}
	catch(err) {
		res.statusMessage = err.message
		res.sendStatus(400)
		console.log(`Error: ${err}`)
	}
	finally {
		db.close()
	}
})	


// GET all media for the given decoration design id
// for example, /sales/mediasearch/decoration?decoration=?&location=?&id=?
router.get("/mediasearch/decoration", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })
	const { location, decoration, id } = req.query	

	const media = sz.media[sz.decorations.indexOf(decoration)]

	try {
		if (!sz.decorations.includes(decoration))
			throw new Error("bad params")
		if (!sz.locations.includes(location))
			throw new Error("bad params")

		let statement = db.prepare(/*sql*/`	
				SELECT * FROM ${media}${decoration}Design 
				WHERE ${location}=1 AND 
				${decoration}DesignId=?
		`)
		const data = statement.all(id)
		res.send({
			media,
			data
		})
	}
	catch(err) {
		res.statusMessage = err.message
		res.sendStatus(400)
		console.log(`Error: ${err}`)
	}
	finally {
		db.close()
	}
}) 


/////////////////////////////////////////////////////////
// PUT
//////////////////////////////////////////////////////////


// called by a fetch, saves a salestotal/sales item
router.put("/:orderid", (req, res) => {
	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	const { Products } = req.body

	const salesTotalColumns = ["OrderNumber", "CustomerId", "CustomerOrderNumber", "SalesRep",	
	"OrderDate", "Repeat", "New", "BuyIn", "Terms", "Delivery", "Notes", "DateProcessed", "DateInvoiced"]

	// compile the relevant columns, use the column names from our size table
	const salesColumns = ["OrderId", "GarmentId", "OrderGarmentId", "Price"]
	sz.locations.forEach(location => {
		sz.decorations.forEach(decoration => salesColumns.push(`${location}${decoration}DesignId`))
		sz.media.forEach(medium => {
			salesColumns.push(`${location}${medium}Id`)
			salesColumns.push(`${location}${medium}2Id`)
		})
	})
	sz.allSizes.forEach(size => salesColumns.push(size))

	const date = new Date().toLocaleString()

	try {
		// retrieve current record from database
		let query = /*sql*/`SELECT ${salesTotalColumns.join(",")}
				FROM SalesTotal
				WHERE OrderId=?`
		let original = db.prepare(query).get(req.params.orderid)

		// see if any incoming fields have changed
		// top level properties in our body all belong to the SalesTotal table
		let changedFields = []
		salesTotalColumns.forEach(c => {
			if (original[c] != req.body[c])
				changedFields.push(c)
		})

		db.prepare("BEGIN TRANSACTION").run()
		// if we have changes, update the table
		if (changedFields.length > 0) {
			query = /*sql*/`UPDATE SalesTotal SET 
					${changedFields.map(c => ` ${c}=@${c} `).join(", ")}
					WHERE OrderId=@OrderId`

			db.prepare(query).run(req.body)

			// audit logging
			query = `INSERT INTO AuditLog VALUES (null, 'SalesTotal', ?, 'UPD', ?, ?)`
			let auditLogId = db.prepare(query).run(req.body.OrderId, req.auth.user, date).lastInsertRowid
			changedFields.forEach(f => {
				query = `INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)`
				db.prepare(query).run(auditLogId, f, original[f], req.body[f])
			})
		}

		// the media fields have a "1" inside their names, but the tables don't have this, so normalise 
		// (for example, FrontScreen1Id → FrontScreenId)
		sz.locations.forEach(location => {
			sz.media.forEach(medium => {
				Products[0][`${location}${medium}Id`] = Products[0][`${location}${medium}1Id`]
				delete Products[0][`${location}${medium}1Id`]
			})
		})


		// iterate "Products" which are rows in the Sales Total
		// note, we are only updating the values int the SalesTotal and Sales table
		// the corresponding tables, Order and OrderGarment are not affected,
		// so if you edit something in the Sales history, it becomes out of sync with the those tables
		Products.forEach((product, i) => {
			if (product.removed) {
				// it's been deleted
				// 1. if it's the first item, then move the values for the decoration/media fields to the first non-deleted item
				if (i == 0) {
					let firstNotRemoved = Products.find(p => !p.removed)
					sz.locations.forEach(location => {
						sz.decorations.forEach(decoration => firstNotRemoved[`${location}${decoration}DesignId`] = product[`${location}${decoration}DesignId`])
						sz.media.forEach(medium => {
							firstNotRemoved[`${location}${medium}Id`] = product[`${location}${medium}Id`]
							firstNotRemoved[`${location}${medium}2Id`] = product[`${location}${medium}2Id`]
						 })
						})
					}

				// 2. get original item
				query = "SELECT * FROM Sales WHERE rowid = ?"
				original = db.prepare(query).get(product.salesrowid)

				// 3. add quantities back into stock
				// the question here is, what happens if a user changes the quantities, and then deletes it?
				// we can either use the incoming quantities or discard the changes to quantities and use the original item's quantities
				// we will use the original quantities
				query = "SELECT * FROM Garment WHERE GarmentId = ?"
				let garment = db.prepare(query).get(product.GarmentId)

				let changedSizes = [] 
				sz.allSizes.forEach(size => {
					if (product[size] != 0)
						changedSizes.push(size) // not really changed, but we want all product sizes that aren't 0
				})

				query = /*sql*/`UPDATE Garment SET ${changedSizes.map(s => `${s}=${s}+@${s}`).join(",")}
						WHERE GarmentId=@GarmentId`
				db.prepare(query).run(product)
				query = "INSERT INTO AuditLog VALUES (null, 'Garment', ?, 'UPD', ?, ?)"
				auditLogId = db.prepare(query).run(product.GarmentId, req.auth.user, date).lastInsertRowid
				query = "INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)"
				changedSizes.forEach(size => {
					db.prepare(query).run(auditLogId, size, garment[size], garment[size] + product[size])
				})
				
				// 4. remove from Sales table
				query = "DELETE FROM Sales WHERE rowid=?"
				db.prepare(query).run(product.salesrowid)
				
				query = "INSERT INTO AuditLog VALUES (null, 'Sales', ?, 'DEL', ?, ?)"
				auditLogId = db.prepare(query).run(product.salesrowid, req.auth.user, date).lastInsertRowid
				query = "INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, null)"
				salesColumns.forEach(col => {
					if (original[col])
						db.prepare(query).run(auditLogId, col, original[col])
				})

			} //~ product.removed

			else if (product.added) {
				// 1. it's new so do an insert
				changedFields = []
				salesColumns.forEach(c => {
					if (product[c] != null)
						changedFields.push(c)
				})
				query = `INSERT INTO Sales (OrderId, ${changedFields.join(",")}) VALUES (${req.params.orderid}, ${changedFields.map(c => `@${c}`).join(",")})`
				let newRowid = db.prepare(query).run(product).lastInsertRowid
				query = "INSERT INTO AuditLog VALUES (null, 'Sales', ?, 'INS', ?, ?)"
				auditLogId = db.prepare(query).run(newRowid, req.auth.user, date).lastInsertRowid
				query = "INSERT INTO AuditLogEntry VALUES (null, ?, ?, null, ?)"
				changedFields.forEach(f => {
					db.prepare(query).run(auditLogId, f, product[f])
				})
				
				// 2. remove quantities from stock levels
				let changedSizes = sz.allSizes.filter(s => product[s] > 0)
				if (changedSizes.length > 0) { // because sometimes every size is 0
					query = "INSERT INTO AuditLog VALUES (null, 'Garment', ?, 'UPD', ?, ?)"
					auditLogId = db.prepare(query).run(product.GarmentId, req.auth.user, date).lastInsertRowid
					original = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(product.GarmentId)
					query = `UPDATE Garment SET ${changedSizes.map(s => `${s}=${s}-${product[s]}`).join(",")} WHERE GarmentId=?`
					let q2 = "INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)"
					changedSizes.forEach(function(size) {
						db.prepare(query).run(product.GarmentId)
						db.prepare(q2).run(auditLogId, size, original[size], original[size] - product[size])
					})
			}
			} //~ product.added

			else { // update existing product
				// 1. iterate fields to see if anything has changed
				let original = db.prepare("SELECT * FROM Sales WHERE rowid=?").get(product.salesrowid)
				changedFields = []
				salesColumns.forEach(col => {
					if (col != "OrderId" && col != "OrderGarmentId")
						if (original[col] != product[col])
							changedFields.push(col)
				})

				// 2. update statement for changes
				if (changedFields.length > 0) {
					let query = `UPDATE Sales SET ${changedFields.map(f => `${f}=@${f}`).join(", ")} WHERE rowid=@salesrowid`
					db.prepare(query).run(product)
					query = "INSERT INTO AuditLog VALUES (null, 'Sales', ?, 'UPD', ?, ?)"
					auditLogId = db.prepare(query).run(product.salesrowid, req.auth.user, date).lastInsertRowid
					query = "INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)"
					changedFields.forEach(f => {
						db.prepare(query).run(auditLogId, f, original[f], product[f])
					})

					// 3. if quantities are lower, add back into stock, or if quantities are higher, remove from stock
					changedSizes = sz.allSizes.filter(size => original[size] != product[size])
					if (changedSizes.length > 0){
						query = "INSERT INTO AuditLog VALUES (null, 'Garment', ?, 'UPD', ?, ?)"
						const originalGarment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(product.GarmentId)
						auditLogId = db.prepare(query).run(product.GarmentId, req.auth.user, date).lastInsertRowid
						query = `UPDATE Garment SET ${changedSizes.map(s => `${s}=${s} + (${original[s]} - @${s})`).join(", ")} WHERE GarmentId=@GarmentId`
						db.prepare(query).run(product)
						query = "INSERT INTO AuditLogEntry VALUES (null, ?, ?, ?, ?)"
						changedSizes.forEach(size => {
							db.prepare(query).run(auditLogId, size, originalGarment[size], originalGarment[size] + (original[size] - product[size]) )
						})
					}//~ changedSizes.length
				}//~ changedFields.length

			} //~ end update existing product

		}) //~ Products.forEach

		db.prepare("COMMIT").run()
		res.send()
	}
	catch(err) {
		res.statusMessage = err.message
		res.sendStatus(400)

		db.prepare("ROLLBACK").run()
		console.log(`Error: ${err}`)
	}
	finally {
		db.close()
	}

})



module.exports = router
