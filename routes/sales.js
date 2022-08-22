const express = require("express")
const router = express.Router()

const Database = require("better-sqlite3");
const sz = require("../sizes.js")

/* GET Sales page. */
router.get("/", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		res.render("sales.ejs", {
			title: "Sales History",
			user: req.auth.user,
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
		const customers = db.prepare("SELECT Customer.CustomerId, Customer.Company FROM Customer INNER JOIN Sales ON Sales.CustomerId=Customer.CustomerId GROUP BY Customer.CustomerId ORDER BY 2 COLLATE NOCASE").all()
		res.send(
			customers.map(c => {
				return {
					value: c.CustomerId,
					name: c.Company
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
		const customers = db.prepare("SELECT Customer.CustomerId, Code FROM Customer INNER JOIN Sales ON Sales.CustomerId=Customer.CustomerId GROUP BY Customer.CustomerId ORDER BY 2 COLLATE NOCASE").all()

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
					name: c.Code
				}
			})
		)
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

	// 
	// 


	try {
		let query = `SELECT Garment.Code || ' ' || Garment.Label || ' ' || Garment.Type || ' ' || Garment.Colour AS Garment 
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
			LEFT OUTER JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=Sales.PocketEmbroideryDesignId
			LEFT OUTER JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=Sales.SleeveEmbroideryDesignId
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

module.exports = router
