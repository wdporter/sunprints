const express = require("express")
const router = express.Router()

const Database = require("better-sqlite3");
const sz = require("../sizes.js")

/* GET Sales page. */
router.get("/", (req, res) => {

		res.render("sales.ejs", {
			title: "Sales History",
			user: req.auth.user,
		})

})


router.get("/dt", (req, res) => {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
console.log(req.query.customSearch)
		let query = `SELECT COUNT(*) AS Count FROM SalesTotal`
		let statement = db.prepare(query)
		let recordsTotal = recordsFiltered = statement.all().reduce((acc, curr) => { return acc + curr.Count}, 0)
		

		query = `SELECT SalesTotal.OrderId, SalesTotal.OrderNumber, SalesTotal.OrderDate, SalesRep, SalesTotal.DateProcessed, 
		SalesTotal.Delivery, Customer.Code, Customer.Company, SalesTotal.Terms, SalesTotal.BuyIn, SalesTotal.Notes, SalesTotal.Done
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
				where.push(`SalesRep = @SalesRep`)
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
				params.Usb = req.query.customSearch.Usb
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
		const query2 = db.prepare(`SELECT 
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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		const customers = db.prepare("SELECT Customer.CustomerId, Customer.Company, Code FROM Customer INNER JOIN SalesTotal ON SalesTotal.CustomerId=Customer.CustomerId GROUP BY Customer.CustomerId ORDER BY 2 COLLATE NOCASE").all()

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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
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
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		const names = db.prepare(`SELECT TransferNameId, IFNULL(Name, 'no name') AS Name 
		WHERE TransferNameId IN (
			SELECT FrontTransferNameId FROM Sales 
			UNION SELECT FrontTransferName2Id FROM Sales 
			UNION SELECT BackTransferNameId FROM Sales 
			UNION SELECT BackTransferName2Id FROM Sales 
			UNION SELECT SleeveTransferNameId FROM Sales
			UNION SELECT SleeveTransferName2Id FROM Sales
			UNION SELECT PocketTransferNameId FROM Sales
			UNION SELECT PocketTransferName2Id FROM Sales)
		FROM TransferName ORDER BY 2 COLLATE NOCASE`).all()
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

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		let query = `SELECT Garment.Code || ' ' || Garment.Label || ' ' || Garment.Type || ' ' || Garment.Colour AS Product 
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
			LEFT OUTER JOIN PrintDesign spd ON spd.PrintDesignId=Sales.PocketPrintDesignId
			LEFT OUTER JOIN PrintDesign ppd ON ppd.PrintDesignId=Sales.SleevePrintDesignId
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
			LEFT OUTER JOIN TransferDesign std ON std.TransferDesignId=Sales.PocketTransferDesignId
			LEFT OUTER JOIN TransferDesign ptd ON ptd.TransferDesignId=Sales.SleeveTransferDesignId
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

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		let query = `SELECT SalesTotal.OrderNumber, Customer.Company, SalesRep, SalesTotal.OrderDate,
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


router.get("/edit/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		let query = `SELECT 
		SalesTotal.OrderId, SalesTotal.OrderNumber, SalesTotal.CustomerId, SalesTotal.SalesRep, SalesTotal.OrderDate, SalesTotal.Repeat, SalesTotal.New, SalesTotal.BuyIn, SalesTotal.Terms, SalesTotal.Delivery,SalesTotal.Notes, SalesTotal.CustomerOrderNumber, SalesTotal.DateProcessed, SalesTotal.DateInvoiced, 	
		Sales.GarmentId,
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
		INNER JOIN Sales ON Sales.OrderId=SalesTotal.OrderId 
		INNER JOIN Garment ON Sales.GarmentId=Garment.GarmentId
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
		
		const orderDetails = db.prepare(query).all(req.params.id)

		const order = {
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
			const product = 
			{
				GarmentId: od.GarmentId,
				Deleted: od.Deleted,
				Code: od.Code,
				Label: od.Label,
				Type: od.Type,
				Colour: od.Colour,
				Notes: od.GarmentNotes,
				SizeCategory: od.SizeCategory
			}

			sz.sizes[od.SizeCategory].forEach(sz => product[sz] = od[sz] )

			const locations = ["Front", "Back", "Pocket", "Sleeve"]
			const decorations = ["Print", "Embroidery", "Transfer"]
			const media = ["Screen", "Usb", "TransferName"]

			locations.forEach(loc => {
				decorations.forEach(dec => {
					product[`${loc}${dec}DesignId`] = od[`${loc}${dec}DesignId`]
					product[`${loc}${dec}DesignName`] = od[`${loc}${dec}DesignName`]
				})

				media.forEach(m => {
					product[`${loc}${m}1Id`] = od[`${loc}${m}1Id`]
					product[`${loc}${m}1Name`] = od[`${loc}${m}1Name`]
					product[`${loc}${m}2Id`] = od[`${loc}${m}2Id`]
					product[`${loc}${m}2Name`] = od[`${loc}${m}2Name`]
				})
			})

			locations.forEach(loc => {
				if (product[`${loc}Screen1Name`] == "(standard)  ")
					product[`${loc}Screen1Name`] = null
				if (product[`${loc}Screen2Name`] == "(standard)  ")
					product[`${loc}Screen2Name`] = null
			})

			order.Products.push(product)
		})

		const customers = db.prepare("SELECT CustomerId, Company || CASE WHEN Deleted=1 THEN ' (deleted)' ELSE '' END AS Company  FROM Customer ORDER BY Company").all()
		const salesReps = db.prepare("SELECT Name || CASE WHEN Deleted=1 THEN ' (deleted)' ELSE '' END AS Name FROM SalesRep ORDER BY Deleted, Name").all().map(sr => sr.Name)
		const sizes = sz.allSizes

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

module.exports = router
