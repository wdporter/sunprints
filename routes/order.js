const express = require("express")
const router = express.Router()
const Database = require("better-sqlite3");
const sz = require("../sizes.js");


/* GET orders page. */
router.get("/", function (req, res, next) {
	res.render("order.ejs", {
		title: "Orders",
		user: req.auth.user
	})
})

/* GET orders in datatables format. */
router.get("/dt", function (req, res, next) {

	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		const recordsTotal = db.prepare(`SELECT Count(*) as count 
FROM Orders  
WHERE Deleted=0 AND ProcessedDate IS NULL  `).get().count
		let recordsFiltered = recordsTotal

		let query = `SELECT Orders.*, Customer.Company AS CustomerName 
FROM Orders 
INNER JOIN Customer ON Customer.CustomerId=Orders.CustomerId   
WHERE Orders.Deleted=0 AND ProcessedDate IS NULL  `
		if (req.query.search.value)
			req.query.search.value = req.query.search.value.trim()

		if (req.query.search.value) {
			let whereClause = ` AND OrderNumber LIKE '%${req.query.search.value}%' 
				OR Customer.Company LIKE '%${req.query.search.value}%' 
				OR Orders.Notes LIKE '%${req.query.search.value}%' `
			recordsFiltered = db.prepare(`SELECT Count(*) AS count 
FROM Orders 
INNER JOIN Customer ON Customer.CustomerId=Orders.CustomerId 
WHERE Orders.Deleted=0 AND ProcessedDate ISNULL
${whereClause}`).get().count
			query += whereClause
		}

		const columns = ["OrderId", "OrderId", "OrderNumber", "", "Done", "Customer.Company", "CustomerOrderNumber", "OrderDate", "InvoiceDate", "Repeat", "New", "BuyIn", "Terms", "SalesRep", "Notes", "DeliveryDate", "ProcessedDate"]
		const orderByClause = req.query.order.map(o => {
			return ` ${columns[Number(o.column)]} COLLATE NOCASE ${o.dir} `
		})
		query += ` ORDER BY ${orderByClause.join(",")}`

		query += `LIMIT ${req.query.length} OFFSET ${req.query.start}`
		const orders = db.prepare(query).all()

		// we have to get all the designs used on this order
		orders.forEach(o => {
			o.Designs = new Set()

			const query = db.prepare(`SELECT 
			fp.Code || fp.Notes AS fp
			,bp.Code || bp.Notes AS bp
			,pp.Code || pp.Notes AS pp
			,sp.Code || sp.Notes AS sp
			,fe.Code || fe.Notes AS fe
			,be.Code || be.Notes AS be
			,pe.Code || pe.Notes AS pe
			,se.Code || se.Notes AS se
			,ft.Code || ft.Notes AS ft
			,bt.Code || bt.Notes AS bt
			,pt.Code || pt.Notes AS pt
			,st.Code || st.Notes AS st
			FROM OrderGarment
			LEFT JOIN PrintDesign fp ON fp.PrintDesignId=OrderGarment.FrontPrintDesignId
			LEFT JOIN PrintDesign bp ON bp.PrintDesignId=OrderGarment.BackPrintDesignId
			LEFT JOIN PrintDesign pp ON pp.PrintDesignId=OrderGarment.PocketPrintDesignId
			LEFT JOIN PrintDesign sp ON sp.PrintDesignId=OrderGarment.SleevePrintDesignId
			LEFT JOIN EmbroideryDesign fe ON fe.EmbroideryDesignId=OrderGarment.FrontEmbroideryDesignId
			LEFT JOIN EmbroideryDesign be ON be.EmbroideryDesignId=OrderGarment.BackEmbroideryDesignId
			LEFT JOIN EmbroideryDesign pe ON pe.EmbroideryDesignId=OrderGarment.PocketEmbroideryDesignId
			LEFT JOIN EmbroideryDesign se ON se.EmbroideryDesignId=OrderGarment.SleeveEmbroideryDesignId
			LEFT JOIN TransferDesign ft ON ft.TransferDesignId=OrderGarment.FrontTransferDesignId
			LEFT JOIN TransferDesign bt ON bt.TransferDesignId=OrderGarment.BackTransferDesignId
			LEFT JOIN TransferDesign pt ON pt.TransferDesignId=OrderGarment.PocketTransferDesignId
			LEFT JOIN TransferDesign st ON st.TransferDesignId=OrderGarment.SleeveTransferDesignId
			WHERE OrderGarment.OrderId=?`)
			const printDesignResults = query.all(o.OrderId)
			printDesignResults.forEach(pdr => {
				Object.keys(pdr).forEach(key => {
					if (pdr[key] ) {
						o.Designs.add(pdr[key])
					}
						
				})
			})
			o.Designs = [...o.Designs]
		})


		res.send({
			draw: Number(req.query.draw),
			recordsTotal,
			recordsFiltered,
			data: orders
		})
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400)
		console.log(`error: get("/dt") ${ex.message}`)
	}

	finally {
		db.close()
	}
})



/* GET new orders page. */
router.get("/new", function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	let customer = null
	let garments = []
	let order = null

	try {
		if (req.query.customerid) {
			statement = db.prepare(`SELECT * FROM Customer WHERE Deleted=0 AND CustomerId=?`)
			customer = statement.get(req.query.customerid)
		}

		if (req.query.clone) {
			order = db.prepare("SELECT * FROM Orders WHERE OrderId=?").get(req.query.clone)
			order.OrderId = 0
			order.OrderDate = new Date().toISOString()
			order.DeliverDate = ""
			customer = db.prepare("SELECT * FROM Customer WHERE CustomerId=?").get(order.CustomerId)
		}

		const salesReps = db.prepare("SELECT Name, Deleted FROM SalesRep WHERE Deleted=0").all()

		res.render("order_new.ejs", {
			title: "New Order",
			mode: "new",
			customer,
			order,
			garments,
			user: req.auth.user,
			salesReps,
			locations: sz.locations
		})

	}
	catch (ex) {
		//ignore, customer/garment can stay as null
		console.log(ex.message)
	}
	finally {
		db.close()
	}
})


/* GET edit page, reüsing the new orders view. */
router.get("/edit", function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	var customerInfo
	try {

		var query = `SELECT Customer.CustomerId, Code, Customer.Company FROM Customer INNER JOIN Orders ON Orders.CustomerId = Customer.CustomerId WHERE Orders.OrderId=?`
		var customer = db.prepare(query).get(req.query.id)

		query = `SELECT * FROM Orders WHERE OrderId=?`
		var order = db.prepare(query).get(req.query.id)

		query = `SELECT OrderGarmentId, OrderGarment.GarmentId, Type, 
		FrontPrintDesignId, FrontScreenId, FrontScreen2Id,
		BackPrintDesignId, BackScreenId, BackScreen2Id,
		SleevePrintDesignId, SleeveScreenId, SleeveScreen2Id,
		PocketPrintDesignId, PocketScreenId, PocketScreen2Id, 
		FrontEmbroideryDesignId, FrontUsbId, FrontUsb2Id,
		BackEmbroideryDesignId, BackUsbId, BackUsb2Id,
		SleeveEmbroideryDesignId, SleeveUsbId, SleeveUsb2Id,
		PocketEmbroideryDesignId, PocketUsbId, PocketUsb2Id, 
		FrontTransferDesignId, FrontTransferNameId, FrontTransferName2Id,
		BackTransferDesignId, BackTransferNameId, BackTransferName2Id,
		SleeveTransferDesignId, SleeveTransferNameId, SleeveTransferName2Id,
		PocketTransferDesignId, PocketTransferNameId, PocketTransferName2Id, 
		Code, Type, Colour, Label, Price,  
		${sz.sizes.Kids.map(s => `OrderGarment.${s}`).join(" , ")}, 
		${sz.sizes.Womens.map(s => `OrderGarment.${s}`).join(" , ")}, 
		${sz.sizes.Adults.map(s => `OrderGarment.${s}`).join(" , ")} 
		${sz.sizes.Kids.map(s => `Min${s}`).join(" , ")}, 
		${sz.sizes.Womens.map(s => `Min${s}`).join(" , ")}, 
		${sz.sizes.Adults.map(s => `Min${s}`).join(" , ")}, 
		${sz.sizes.Kids.map(s => ` Garment.${s} AS Qty${s} `).join(" , ")}, 
		${sz.sizes.Womens.map(s => ` Garment.${s} AS Qty${s} `).join(" , ")}, 
		${sz.sizes.Adults.map(s => ` Garment.${s} AS Qty${s} `).join(" , ")} 
		FROM OrderGarment INNER JOIN Garment ON Garment.GarmentId=OrderGarment.GarmentId WHERE OrderId=?`
		var garments = db.prepare(query).all(req.query.id)
		garments.forEach(g => {

			// stock warnings
			if (order.BuyIn) {
				const warnings = []
				for (const size of sz.allSizes) {
					if (g[`Qty${size}`] - g[`Min${size}`] < 0) {
						warnings.push({
							size,
							min: g[`Min${size}`],
							current: g[`Qty${size}`]
						})
					}
				}
				g.stockWarning = warnings
			}

			g.Quantities = {}
			const kidsTotal = sz.sizes.Kids.reduce((acc, curr) => {
				return acc += g[curr]
			}, 0)
			if (kidsTotal) {
				g.SizeCategory = "Kids"
				g.Quantities[g.SizeCategory] = {}
				sz.sizes.Kids.forEach(k => {
					g.Quantities[g.SizeCategory][k.slice(1)] = g[k]
				})
			}
			else {
				const womensTotal = sz.sizes.Womens.reduce((acc, curr) => { return acc += g[curr] }, 0)
				if (womensTotal) {
					g.SizeCategory = "Womens"
					g.Quantities[g.SizeCategory] = {}
					sz.sizes.Womens.forEach(w => {
						g.Quantities[g.SizeCategory][w.slice(1)] = g[w]
					})
				}
				else {
					g.SizeCategory = "Adults"
					g.Quantities[g.SizeCategory] = {}
					sz.sizes.Adults.forEach(a => {
						g.Quantities[g.SizeCategory][a.replace(/"/g, "").slice(1)] = g[a.replace(/"/g, "")]
					})
				}
			}
			sz.sizes.Adults.forEach(s => delete g[s.replace(/"/g, "")])
			sz.sizes.Womens.forEach(s => delete g[s])
			sz.sizes.Kids.forEach(s => delete g[s])

			// populate print design id
			const printDesignIds = []
			if (g.FrontPrintDesignId != null)
				printDesignIds.push(g.FrontPrintDesignId)
			if (g.BackPrintDesignId != null)
				printDesignIds.push(g.BackPrintDesignId)
			if (g.PocketPrintDesignId != null)
				printDesignIds.push(g.PocketPrintDesignId)
			if (g.SleevePrintDesignId != null)
				printDesignIds.push(g.SleevePrintDesignId)
			if (printDesignIds.length) {
				query = `SELECT * FROM PrintDesign WHERE Deleted=0 AND PrintDesignId IN (${printDesignIds.join(",")}) `
				const printDesign = db.prepare(query).get()
				g.selectedPrintDesign = {
					Code: printDesign.Code,
					Notes: printDesign.Notes,
					Comments: printDesign.Comments,
					PrintDesignId: printDesign.PrintDesignId
				}
			}
			delete g.FrontPrintDesignId
			delete g.BackPrintDesignId
			delete g.PocketPrintDesignId
			delete g.SleevePrintDesignId

			// populate embroidery design id
			const embroideryDesignIds = []
			if (g.FrontEmbroideryDesignId != null)
				embroideryDesignIds.push(g.FrontEmbroideryDesignId)
			if (g.BackEmbroideryDesignId != null)
				embroideryDesignIds.push(g.BackEmbroideryDesignId)
			if (g.PocketEmbroideryDesignId != null)
				embroideryDesignIds.push(g.PocketEmbroideryDesignId)
			if (g.SleeveEmbroideryDesignId != null)
				embroideryDesignIds.push(g.SleeveEmbroideryDesignId)
			if (embroideryDesignIds.length) {
				query = `SELECT * FROM EmbroideryDesign WHERE Deleted=0 AND EmbroideryDesignId IN (${embroideryDesignIds.join(",")}) `
				const embroideryDesign = db.prepare(query).get()
				g.selectedEmbroideryDesign = {
					Code: embroideryDesign.Code,
					Notes: embroideryDesign.Notes,
					Comments: embroideryDesign.Comments,
					EmbroideryDesignId: embroideryDesign.EmbroideryDesignId
				}
			}
			delete g.FrontEmbroideryDesignId
			delete g.BackEmbroideryDesignId
			delete g.PocketEmbroideryDesignId
			delete g.SleeveEmbroideryDesignId

			// populate transfer design id
			const transferDesignIds = []
			if (g.FrontTransferDesignId != null)
				transferDesignIds.push(g.FrontTransferDesignId)
			if (g.BackTransferDesignId != null)
				transferDesignIds.push(g.BackTransferDesignId)
			if (g.PocketTransferDesignId != null)
				transferDesignIds.push(g.PocketTransferDesignId)
			if (g.SleeveTransferDesignId != null)
				transferDesignIds.push(g.SleeveTransferDesignId)
			if (transferDesignIds.length) {
				query = `SELECT * FROM TransferDesign WHERE TransferDesignId IN (${transferDesignIds.join(",")}) `
				const transferDesign = db.prepare(query).get()
				g.selectedTransferDesign = {
					Code: transferDesign.Code,
					Notes: transferDesign.Notes,
					TransferDesignId: transferDesign.TransferDesignId
				}
			}
			delete g.FrontTransferDesignId
			delete g.BackTransferDesignId
			delete g.PocketTransferDesignId
			delete g.SleeveTransferDesignId



			// now set available print locations for the selected print design
			if (g.selectedPrintDesign) {
				g.printLocations = {}
				query = `SELECT ${sz.locations.join(",")}, ScreenPrintDesignId, Screen.ScreenId, Colour, Screen.Name, Number 
				FROM ScreenPrintDesign 
				INNER JOIN Screen ON Screen.ScreenId = ScreenPrintDesign.ScreenId
				WHERE SizeCategory=? 
				AND PrintDesignId=? `
				const screenPrintDesigns = db.prepare(query).all(g.SizeCategory, g.selectedPrintDesign.PrintDesignId)
				screenPrintDesigns.forEach(sp => {
					sz.locations.forEach(l => {
						if (sp[l]) {
							if (!g.printLocations[l]) {
								g.printLocations[l] = []
							}
							const obj = {}
							sz.locations.forEach(loc => obj[loc] = 0)
							obj.ScreenPrintDesignId = sp.ScreenPrintDesignId
							obj.ScreenId = sp.ScreenId
							obj[l] = 1
							obj.Colour = sp.Colour
							obj.Name = sp.Name
							obj.Number = sp.Number
							g.printLocations[l].push(obj)
						}
					})
				})

				g.checkedScreens = {}
				for (var loc of sz.locations) {
					g.checkedScreens[loc] = []
					if (g[`${loc}ScreenId`])
						g.checkedScreens[loc].push(g[`${loc}ScreenId`])
					if (g[`${loc}Screen2Id`])
						g.checkedScreens[loc].push(g[`${loc}Screen2Id`])

					delete g[loc + "ScreenId"]
					delete g[loc + "Screen2Id"]
				}
			}

			// now set available embroidery locations
			if (g.selectedEmbroideryDesign) {
				g.embroideryLocations = {}
				query = `SELECT ${sz.locations.join(",")}, UsbEmbroideryDesignId, Usb.UsbId, Number, Notes
				FROM UsbEmbroideryDesign 
				INNER JOIN Usb ON Usb.UsbId = UsbEmbroideryDesign.UsbId
				WHERE SizeCategory=? 
				AND EmbroideryDesignId=? `
				const usbEmbroideryDesigns = db.prepare(query).all(g.SizeCategory, g.selectedEmbroideryDesign.EmbroideryDesignId)
				usbEmbroideryDesigns.forEach(de => {
					sz.locations.forEach(l => {
						if (de[l]) {
							if (!g.embroideryLocations[l]) {
								g.embroideryLocations[l] = []
							}
							const obj = {}
							sz.locations.forEach(loc => obj[loc] = 0)
							obj.usbEmbroideryDesignId = de.usbEmbroideryDesignId
							obj.UsbId = de.UsbId
							obj[l] = 1
							obj.Notes = de.Notes
							obj.Number = de.Number
							g.embroideryLocations[l].push(obj)
						}
					})
				})


				g.checkedUsbs = {}
				for (var loc of sz.locations) {
					g.checkedUsbs[loc] = []

					for (var usb of usbEmbroideryDesigns) {
						if (usb[loc] == 1)
							g.checkedUsbs[loc].push(usb.UsbId)
					}

					delete g[loc + "UsbId"]
					delete g[loc + "Usb2Id"]
				}

			}


			// now set available transfers
			if (g.selectedTransferDesign) {
				g.transferLocations = {}
				query = `SELECT ${sz.locations.join(",")}, TransferNameTransferDesignId, TransferName.TransferNameId, Name
				FROM TransferNameTransferDesign 
				INNER JOIN TransferName ON TransferName.TransferNameId = TransferNameTransferDesign.TransferNameId
				WHERE SizeCategory=? 
				AND TransferDesignId=? `
				const transferNameTransferDesigns = db.prepare(query).all(g.SizeCategory, g.selectedTransferDesign.TransferDesignId)
				transferNameTransferDesigns.forEach(t => {
					sz.locations.forEach(l => {
						if (t[l]) {
							if (!g.transferLocations[l]) {
								g.transferLocations[l] = []
							}
							const obj = {}
							sz.locations.forEach(loc => obj[loc] = 0)
							obj.TransferNameTransferDesignId = t.TransferNameTransferDesignId
							obj.TransferNameId = t.TransferNameId
							obj[l] = 1
							obj.Name = t.Name
							g.transferLocations[l].push(obj)
						}
					})
				})


				g.checkedTransferNames = {}
				for (var loc of sz.locations) {
					g.checkedTransferNames[loc] = []

					for (var t of transferNameTransferDesigns) {
						if (t[loc] == 1)
							g.checkedTransferNames[loc].push(t.TransferNameTransferDesignId)
					}

					delete g[loc + "TransferNameId"]
					delete g[loc + "TransferName2Id"]
				}
			}
		})

		query = `SELECT Name, Deleted FROM SalesRep WHERE Deleted=0 `
		if (order && order.SalesRep)
			query += ` OR Name='${order.SalesRep}' `
		const salesReps = db.prepare(query).all()

		res.render("order_new.ejs", {
			title: "Edit Order",
			mode: "edit",
			orderid: req.query.id,
			customer,
			order,
			garments,
			user: req.auth.user,
			salesReps,
			locations: sz.locations
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


// GET the jobsheet page
router.get("/jobsheet/:id", function (req, res) {

	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		let statement = db.prepare(`SELECT Customer.* 
		FROM Orders 
		INNER JOIN Customer ON Customer.CustomerId = Orders.CustomerId
		WHERE OrderId=?`)
		const customer = statement.get(req.params.id)

		statement = db.prepare(`SELECT * 
		FROM Orders 
		WHERE OrderId=?`)
		const order = statement.get(req.params.id)

		statement = db.prepare(`SELECT Garment.Code AS Code, Label, Type, Garment.Colour AS Colour, OrderGarment.* 
	,PrintDesignF.Code || ' ' || IFNULL(PrintDesignF.Notes, '') || ' ' || IFNULL(PrintDesignF.Comments, '') AS FrontPrintDesign
  ,ScreenF1.Number || ' ' || IFNULL(ScreenF1.Name, '') || ' ' || IFNULL(ScreenF1.Colour, '') AS FrontScreen1
  ,ScreenF2.Number || ' ' || IFNULL(ScreenF2.Name, '') || ' ' || IFNULL(ScreenF2.Colour, '') AS FrontScreen2
  ,PrintDesignB.Code || ' ' || IFNULL(PrintDesignB.Notes, '') || ' ' || IFNULL(PrintDesignB.Comments, '') AS BackPrintDesign
  ,ScreenB1.Number || ' ' || IFNULL(ScreenB1.Name, '') || ' ' || IFNULL(ScreenB1.Colour, '') AS BackScreen1
  ,ScreenB2.Number || ' ' || IFNULL(ScreenB2.Name, '') || ' ' || IFNULL(ScreenB2.Colour, '') AS BackScreen2
  ,PrintDesignP.Code || ' ' || IFNULL(PrintDesignP.Notes, '') || ' ' || IFNULL(PrintDesignP.Comments, '') AS PocketPrintDesign
  ,ScreenP1.Number || ' ' || IFNULL(ScreenP1.Name, '') || ' ' || IFNULL(ScreenP1.Colour, '') AS PocketScreen1
  ,ScreenP2.Number || ' ' || IFNULL(ScreenP2.Name, '') || ' ' || IFNULL(ScreenP2.Colour, '') AS PocketScreen2
  ,PrintDesignS.Code || ' ' || IFNULL(PrintDesignS.Notes, '') || ' ' || IFNULL(PrintDesignS.Comments, '') AS SleevePrintDesign
  ,ScreenS1.Number || ' ' || IFNULL(ScreenS1.Name, '') || ' ' || IFNULL(ScreenS1.Colour, '') AS SleeveScreen1
  ,ScreenS2.Number || ' ' || IFNULL(ScreenS2.Name, '') || ' ' || IFNULL(ScreenS2.Colour, '') AS SleeveScreen2
  ,EmbroideryDesignF.Code || ' ' || IFNULL(EmbroideryDesignF.Notes, '') || ' ' || IFNULL(EmbroideryDesignF.Comments, '') AS FrontEmbroideryDesign
  ,UsbF1.Number || ' ' || IFNULL(UsbF1.Notes, '') AS FrontUsb1
  ,UsbF2.Number || ' ' || IFNULL(UsbF2.Notes, '') AS FrontUsb2
  ,EmbroideryDesignB.Code || ' ' || IFNULL(EmbroideryDesignB.Notes, '') || ' ' || IFNULL(EmbroideryDesignB.Comments, '') AS BackEmbroideryDesign
  ,UsbB1.Number || ' ' || IFNULL(UsbB1.Notes, '') AS BackUsb1
  ,UsbB2.Number || ' ' || IFNULL(UsbB2.Notes, '') AS BackUsb2
  ,EmbroideryDesignP.Code || ' ' || IFNULL(EmbroideryDesignP.Notes, '') || ' ' || IFNULL(EmbroideryDesignP.Comments, '') AS PocketEmbroideryDesign
  ,UsbP1.Number || ' ' || IFNULL(UsbP1.Notes, '') AS PocketUsb1
  ,UsbP2.Number || ' ' || IFNULL(UsbP2.Notes, '') AS PocketUsb2
  ,EmbroideryDesignS.Code || ' ' || IFNULL(EmbroideryDesignS.Notes, '') || ' ' || IFNULL(EmbroideryDesignS.Comments, '') AS SleeveEmbroideryDesign
  ,UsbS1.Number || ' ' || IFNULL(UsbS1.Notes, '') AS SleeveUsb1
  ,UsbS2.Number || ' ' || IFNULL(UsbS2.Notes, '') AS SleeveUsb2
  ,TransferDesignF.Code || ' ' || IFNULL(TransferDesignF.Notes, '') AS FrontTransferDesign
  ,TransferNameF1.Name AS FrontTransferName1
  ,TransferNameF2.Name AS FrontTransferName2
  ,TransferDesignB.Code || ' ' || IFNULL(TransferDesignB.Notes, '') AS BackTransferDesign
  ,TransferNameB1.Name AS BackTransferName1
  ,TransferNameB2.Name AS BackTransferName2
  ,TransferDesignP.Code || ' ' || IFNULL(TransferDesignP.Notes, '') PocketTransferDesign
  ,TransferNameP1.Name AS PocketTransferName1
  ,TransferNameP2.Name AS PocketTransferName2
  ,TransferDesignS.Code || ' ' || IFNULL(TransferDesignS.Notes, '') AS SleeveTransferDesign
  ,TransferNameS1.Name AS SleeveTransferName1
  ,TransferNameS2.Name AS SleeveTransferName2
		FROM OrderGarment
		INNER JOIN Garment ON Garment.GarmentId = OrderGarment.GarmentId
		LEFT JOIN PrintDesign AS PrintDesignF ON PrintDesignF.PrintDesignId=FrontPrintDesignId
  LEFT JOIN Screen AS ScreenF1 ON ScreenF1.ScreenId=FrontScreenId
  LEFT JOIN Screen AS ScreenF2 ON ScreenF2.ScreenId=FrontScreen2Id
  LEFT JOIN PrintDesign AS PrintDesignB ON PrintDesignB.PrintDesignId=BackPrintDesignId
  LEFT JOIN Screen AS ScreenB1 ON ScreenB1.ScreenId=BackScreenId
  LEFT JOIN Screen AS ScreenB2 ON ScreenB2.ScreenId=BackScreen2Id
  LEFT JOIN PrintDesign AS PrintDesignP ON PrintDesignP.PrintDesignId=PocketPrintDesignId
  LEFT JOIN Screen AS ScreenP1 ON ScreenP1.ScreenId=PocketScreenId
  LEFT JOIN Screen AS ScreenP2 ON ScreenP2.ScreenId=PocketScreen2Id
  LEFT JOIN PrintDesign AS PrintDesignS ON PrintDesignS.PrintDesignId=SleevePrintDesignId
  LEFT JOIN Screen AS ScreenS1 ON ScreenS1.ScreenId=SleeveScreenId
  LEFT JOIN Screen AS ScreenS2 ON ScreenS2.ScreenId=SleeveScreen2Id
  LEFT JOIN EmbroideryDesign AS EmbroideryDesignF ON EmbroideryDesignF.EmbroideryDesignId=FrontEmbroideryDesignId
  LEFT JOIN Usb AS UsbF1 ON UsbF1.UsbId=FrontUsbId
  LEFT JOIN Usb AS UsbF2 ON UsbF2.UsbId=FrontUsb2Id
  LEFT JOIN EmbroideryDesign AS EmbroideryDesignB ON EmbroideryDesignB.EmbroideryDesignId=BackEmbroideryDesignId
  LEFT JOIN Usb AS UsbB1 ON UsbB1.UsbId=BackUsbId
  LEFT JOIN Usb AS UsbB2 ON UsbB2.UsbId=BackUsb2Id
  LEFT JOIN EmbroideryDesign AS EmbroideryDesignP ON EmbroideryDesignP.EmbroideryDesignId=OrderGarment.PocketEmbroideryDesignId
  LEFT JOIN Usb AS UsbP1 ON UsbP1.UsbId=PocketUsbId
  LEFT JOIN Usb AS UsbP2 ON UsbP2.UsbId=PocketUsb2Id
  LEFT JOIN EmbroideryDesign AS EmbroideryDesignS ON EmbroideryDesignS.EmbroideryDesignId=SleeveEmbroideryDesignId
  LEFT JOIN Usb AS UsbS1 ON UsbS1.UsbId=SleeveUsbId
  LEFT JOIN Usb AS UsbS2 ON UsbS2.UsbId=SleeveUsb2Id
  LEFT JOIN TransferDesign AS TransferDesignF ON TransferDesignF.TransferDesignId=FrontTransferDesignId
  LEFT JOIN TransferName AS TransferNameF1 ON TransferNameF1.TransferNameId=FrontTransferNameId
  LEFT JOIN TransferName AS TransferNameF2 ON TransferNameF2.TransferNameId=FrontTransferName2Id
  LEFT JOIN TransferDesign AS TransferDesignB ON TransferDesignB.TransferDesignId=BackTransferDesignId
  LEFT JOIN TransferName AS TransferNameB1 ON TransferNameB1.TransferNameId=BackTransferNameId
  LEFT JOIN TransferName AS TransferNameB2 ON TransferNameB2.TransferNameId=BackTransferName2Id
  LEFT JOIN TransferDesign AS TransferDesignP ON TransferDesignP.TransferDesignId=PocketTransferDesignId
  LEFT JOIN TransferName AS TransferNameP1 ON TransferNameP1.TransferNameId=PocketTransferNameId
  LEFT JOIN TransferName AS TransferNameP2 ON TransferNameP2.TransferNameId=PocketTransferName2Id
  LEFT JOIN TransferDesign AS TransferDesignS ON TransferDesignS.TransferDesignId=SleeveTransferDesignId
  LEFT JOIN TransferName AS TransferNameS1 ON TransferNameS1.TransferNameId=SleeveTransferNameId
  LEFT JOIN TransferName AS TransferNameS2 ON TransferNameS2.TransferNameId=SleeveTransferName2Id

		WHERE OrderId=?
		`)
		garments = statement.all(req.params.id)

		garments.forEach(g => {
			g.adultsQuantity = g.AXS + g.ASm + g.AM + g.AL + g.AXL + g.A2XL + g.A3XL + g.A4XL + g.A5XL + g.A6XL + g.A7XL + g.A8XL
			g.kidsQuantity = g.K0 + g.K1 + g.K2 + g.K4 + g.K6 + g.K8 + g.K10 + g.K12 + g.K14 + g.K16
			g.womensQuantity = g.W6 + g.W8 + g.W10 + g.W12 + g.W14 + g.W16 + g.W18 + g.W20 + g.W22 + g.W24 + g.W26 + g.W28
		})

		const designResults = getDesigns(db, req.params.id)

		const screensCount = sz.locations.reduce(function(acc, curr){
			return acc + designResults.screens[curr].length
		}, 0)
		const usbsCount = sz.locations.reduce(function(acc, curr){
			return acc + designResults.usbs[curr].length
		}, 0)
		const transfersCount = sz.locations.reduce(function(acc, curr){
			return acc + designResults.transfers[curr].length
		}, 0)

		res.render("jobsheet.ejs", {
			customer,
			order,
			garments,
			screens: designResults.screens,
			usbs: designResults.usbs,
			transfers: designResults.transfers,
			locations: sz.locations,
			screensCount,
			usbsCount,
			transfersCount
		})

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		if (db != null)
			db.close()
	}

})


/* GET deleted Orders page. */
router.get("/deleted", function (req, res, next) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	const deleted = db.prepare("SELECT * FROM Orders WHERE DELETED=1 ORDER BY LastModifiedDateTime DESC").all()

	res.render("deleted/orders.ejs", {
		title: "Deleted Orders",
		user: req.auth.user,
		deleted
	})
})


// GET return the printable printdesigns page
router.get("/printdesigns/:id", function (req, res) {

	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		const results = getDesigns(db, req.params.id)

		let statement = db.prepare(`SELECT OrderNumber FROM Orders WHERE OrderId=?`)
		results.orderNumber = statement.get(req.params.id).OrderNumber

		results.locations = sz.locations

		res.render("printdesigns.ejs", results)

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
	}

	finally {
		db.close()
	}


})


/* GET the garments on an order, used when you click a datatables row on the Order list page. */
router.get("/dt/garments/:orderId", function (req, res) {
	
	let db = null
	try {
		db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

		// || is the concatenation operator in sqlite
		let statement = db.prepare(`SELECT Garment.Code || ' ' || Label || ' ' || ' ' || Type || ' ' || Garment.Colour AS Garment, Price, 	
  OrderGarment.K0, OrderGarment.K1, OrderGarment.K2, OrderGarment.K4, OrderGarment.K6, OrderGarment.K8, OrderGarment.K10,	OrderGarment.K12, OrderGarment.K14, OrderGarment.K16,
  OrderGarment.W6, OrderGarment.W8, OrderGarment.W10, OrderGarment.W12, OrderGarment.W14, OrderGarment.W16, OrderGarment.W18, OrderGarment.W20, OrderGarment.W22, OrderGarment.W24, OrderGarment.W26, OrderGarment.W28, 
  OrderGarment.AXS, OrderGarment.ASm, OrderGarment.AM, OrderGarment.AL, OrderGarment.AXL, OrderGarment.A2XL, OrderGarment.A3XL, OrderGarment.A4XL, OrderGarment.A5XL, OrderGarment.A6XL, OrderGarment.A7XL, OrderGarment.A8XL
  ,PrintDesignF.Code || ' ' || IFNULL(PrintDesignF.Notes, '') AS FrontPrintDesign
  ,ScreenF1.Number || ' ' || IFNULL(ScreenF1.Name, '') || ' ' || IFNULL(ScreenF1.Colour, '') AS FrontScreen1
  ,ScreenF2.Number || ' ' || IFNULL(ScreenF2.Name, '') || ' ' || IFNULL(ScreenF2.Colour, '') AS FrontScreen2
  ,PrintDesignB.Code || ' ' || IFNULL(PrintDesignB.Notes, '') AS BackPrintDesign
  ,ScreenB1.Number || ' ' || IFNULL(ScreenB1.Name, '') || ' ' || IFNULL(ScreenB1.Colour, '') AS BackScreen1
  ,ScreenB2.Number || ' ' || IFNULL(ScreenB2.Name, '') || ' ' || IFNULL(ScreenB2.Colour, '') AS BackScreen2
  ,PrintDesignP.Code || ' ' || IFNULL(PrintDesignP.Notes, '') AS PocketPrintDesign
  ,ScreenP1.Number || ' ' || IFNULL(ScreenP1.Name, '') || ' ' || IFNULL(ScreenP1.Colour, '') AS PocketScreen1
  ,ScreenP2.Number || ' ' || IFNULL(ScreenP2.Name, '') || ' ' || IFNULL(ScreenP2.Colour, '') AS PocketScreen2
  ,PrintDesignS.Code || ' ' || IFNULL(PrintDesignS.Notes, '') AS SleevePrintDesign
  ,ScreenS1.Number || ' ' || IFNULL(ScreenS1.Name, '') || ' ' || IFNULL(ScreenS1.Colour, '') AS SleeveScreen1
  ,ScreenS2.Number || ' ' || IFNULL(ScreenS2.Name, '') || ' ' || IFNULL(ScreenS2.Colour, '') AS SleeveScreen2
  ,EmbroideryDesignF.Code || ' ' || IFNULL(EmbroideryDesignF.Notes, '') || ' ' || IFNULL(EmbroideryDesignF.Comments, '') AS FrontEmbroideryDesign
  ,UsbF1.Number || ' ' || IFNULL(UsbF1.Notes, '') AS FrontUsb1
  ,UsbF2.Number || ' ' || IFNULL(UsbF2.Notes, '') AS FrontUsb2
  ,EmbroideryDesignB.Code || ' ' || IFNULL(EmbroideryDesignB.Notes, '') || ' ' || IFNULL(EmbroideryDesignB.Comments, '') AS BackEmbroideryDesign
  ,UsbB1.Number || ' ' || IFNULL(UsbB1.Notes, '') AS BackUsb1
  ,UsbB2.Number || ' ' || IFNULL(UsbB2.Notes, '') AS BackUsb2
  ,EmbroideryDesignP.Code || ' ' || IFNULL(EmbroideryDesignP.Notes, '') || ' ' || IFNULL(EmbroideryDesignP.Comments, '') AS PocketEmbroideryDesign
  ,UsbP1.Number || ' ' || IFNULL(UsbP1.Notes, '') AS PocketUsb1
  ,UsbP2.Number || ' ' || IFNULL(UsbP2.Notes, '') AS PocketUsb2
  ,EmbroideryDesignS.Code || ' ' || IFNULL(EmbroideryDesignS.Notes, '') || ' ' || IFNULL(EmbroideryDesignS.Comments, '') AS SleeveEmbroideryDesign
  ,UsbS1.Number || ' ' || IFNULL(UsbS1.Notes, '') AS SleeveUsb1
  ,UsbS2.Number || ' ' || IFNULL(UsbS2.Notes, '') AS SleeveUsb2
  ,TransferDesignF.Code || ' ' || IFNULL(TransferDesignF.Notes, '') AS FrontTransferDesign
  ,TransferNameF1.Name AS FrontTransferName1
  ,TransferNameF2.Name AS FrontTransferName2
  ,TransferDesignB.Code || ' ' || IFNULL(TransferDesignB.Notes, '') AS BackTransferDesign
  ,TransferNameB1.Name AS BackTransferName1
  ,TransferNameB2.Name AS BackTransferName2
  ,TransferDesignP.Code || ' ' || IFNULL(TransferDesignP.Notes, '') AS PocketTransferDesign
  ,TransferNameP1.Name AS PocketTransferName1
  ,TransferNameP2.Name AS PocketTransferName2
  ,TransferDesignS.Code || ' ' || IFNULL(TransferDesignS.Notes, '') AS SleeveTransferDesign
  ,TransferNameS1.Name AS SleeveTransferName1
  ,TransferNameS2.Name AS SleeveTransferName2
  FROM OrderGarment 
  INNER JOIN Orders ON Orders.OrderId = OrderGarment.OrderId 
  INNER JOIN Garment ON Garment.GarmentId = OrderGarment.GarmentId 
  LEFT JOIN PrintDesign AS PrintDesignF ON PrintDesignF.PrintDesignId=FrontPrintDesignId
  LEFT JOIN Screen AS ScreenF1 ON ScreenF1.ScreenId=FrontScreenId
  LEFT JOIN Screen AS ScreenF2 ON ScreenF2.ScreenId=FrontScreen2Id
  LEFT JOIN PrintDesign AS PrintDesignB ON PrintDesignB.PrintDesignId=BackPrintDesignId
  LEFT JOIN Screen AS ScreenB1 ON ScreenB1.ScreenId=BackScreenId
  LEFT JOIN Screen AS ScreenB2 ON ScreenB2.ScreenId=BackScreen2Id
  LEFT JOIN PrintDesign AS PrintDesignP ON PrintDesignP.PrintDesignId=PocketPrintDesignId
  LEFT JOIN Screen AS ScreenP1 ON ScreenP1.ScreenId=PocketScreenId
  LEFT JOIN Screen AS ScreenP2 ON ScreenP2.ScreenId=PocketScreen2Id
  LEFT JOIN PrintDesign AS PrintDesignS ON PrintDesignS.PrintDesignId=SleevePrintDesignId
  LEFT JOIN Screen AS ScreenS1 ON ScreenS1.ScreenId=SleeveScreenId
  LEFT JOIN Screen AS ScreenS2 ON ScreenS2.ScreenId=SleeveScreen2Id
  LEFT JOIN EmbroideryDesign AS EmbroideryDesignF ON EmbroideryDesignF.EmbroideryDesignId=FrontEmbroideryDesignId
  LEFT JOIN Usb AS UsbF1 ON UsbF1.UsbId=FrontUsbId
  LEFT JOIN Usb AS UsbF2 ON UsbF2.UsbId=FrontUsb2Id
  LEFT JOIN EmbroideryDesign AS EmbroideryDesignB ON EmbroideryDesignB.EmbroideryDesignId=BackEmbroideryDesignId
  LEFT JOIN Usb AS UsbB1 ON UsbB1.UsbId=BackUsbId
  LEFT JOIN Usb AS UsbB2 ON UsbB2.UsbId=BackUsb2Id
  LEFT JOIN EmbroideryDesign AS EmbroideryDesignP ON EmbroideryDesignP.EmbroideryDesignId=PocketEmbroideryDesignId
  LEFT JOIN Usb AS UsbP1 ON UsbP1.UsbId=PocketUsbId
  LEFT JOIN Usb AS UsbP2 ON UsbP2.UsbId=PocketUsb2Id
  LEFT JOIN EmbroideryDesign AS EmbroideryDesignS ON EmbroideryDesignS.EmbroideryDesignId=SleeveEmbroideryDesignId
  LEFT JOIN Usb AS UsbS1 ON UsbS1.UsbId=SleeveUsbId
  LEFT JOIN Usb AS UsbS2 ON UsbS2.UsbId=SleeveUsb2Id
  LEFT JOIN TransferDesign AS TransferDesignF ON TransferDesignF.TransferDesignId=FrontTransferDesignId
  LEFT JOIN TransferName AS TransferNameF1 ON TransferNameF1.TransferNameId=FrontTransferNameId
  LEFT JOIN TransferName AS TransferNameF2 ON TransferNameF2.TransferNameId=FrontTransferName2Id
  LEFT JOIN TransferDesign AS TransferDesignB ON TransferDesignB.TransferDesignId=BackTransferDesignId
  LEFT JOIN TransferName AS TransferNameB1 ON TransferNameB1.TransferNameId=BackTransferNameId
  LEFT JOIN TransferName AS TransferNameB2 ON TransferNameB2.TransferNameId=BackTransferName2Id
  LEFT JOIN TransferDesign AS TransferDesignP ON TransferDesignP.TransferDesignId=PocketTransferDesignId
  LEFT JOIN TransferName AS TransferNameP1 ON TransferNameP1.TransferNameId=PocketTransferNameId
  LEFT JOIN TransferName AS TransferNameP2 ON TransferNameP2.TransferNameId=PocketTransferName2Id
  LEFT JOIN TransferDesign AS TransferDesignS ON TransferDesignS.TransferDesignId=SleeveTransferDesignId
  LEFT JOIN TransferName AS TransferNameS1 ON TransferNameS1.TransferNameId=SleeveTransferNameId
  LEFT JOIN TransferName AS TransferNameS2 ON TransferNameS2.TransferNameId=SleeveTransferName2Id
  WHERE Orders.OrderId  = ?  `)

		const records = statement.all(req.params.orderId)


		// delete any sizes or other values that return 0 or null
		records.forEach(record => {
      try {
        record.Price = Number(record.Price).toFixed(2)
        }
      catch(ex) { /* do nothing */ }

      const keys = Object.keys(record)
			keys.forEach(k => {
				if (!record[k]) {
					delete record[k]
				}
			})
		})

		res.send(records)
	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		if (db != null) 
			db.close()
	}

})


router.get("/outstanding/print", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		const statement = db.prepare(`SELECT OrderNumber, OrderDate, DeliveryDate, BuyIn,
		Customer.Company, 
		fpd.Code AS FrontDesign, 
		bpd.Code AS BackDesign, 
		ppd.Code AS PocketDesign, 
		spd.Code AS SleeveDesign,
		K0 + K1 + K2 + K4 + K6 + K8 + K10 + K12 + K14 + K16 + W6 + W8 + W10 + W12 + W14 + W16 + W18 + W20 + W22 + W24 + W26 + W28 + AXS + ASm + AM + AL + AXL + A2XL + A3XL + A4XL + A6XL + A7XL + A8XL AS Qty
		FROM Orders
		INNER JOIN Customer ON Customer.CustomerId=Orders.CustomerId
		INNER JOIN OrderGarment ON OrderGarment.OrderId=Orders.OrderId
		LEFT JOIN PrintDesign fpd ON fpd.PrintDesignId=OrderGarment.FrontPrintDesignId
		LEFT JOIN PrintDesign bpd ON bpd.PrintDesignId=OrderGarment.BackPrintDesignId
		LEFT JOIN PrintDesign ppd ON ppd.PrintDesignId=OrderGarment.PocketPrintDesignId
		LEFT JOIN PrintDesign spd ON spd.PrintDesignId=OrderGarment.SleevePrintDesignId
		WHERE Done=0
		AND (NOT FrontDesign IS NULL OR NOT BackDesign IS NULL OR NOT PocketDesign IS NULL OR NOT SleeveDesign IS NULL)
		ORDER BY 2 ASC`)

		const resultset = statement.all()

		const r2 = {}

		resultset.forEach(r => {
			// if we don't already have it in r2, it's the first time we found it
			if (!r2[r.OrderNumber]) {
				r2[r.OrderNumber] = {
					OrderNumber: r.OrderNumber,
					OrderDate: r.OrderDate,
					DeliveryDate: r.DeliveryDate,
					BuyIn: r.BuyIn,
					Company: r.Company,
					Qty: r.Qty,
					FrontDesign: r.FrontDesign,
					BackDesign: r.BackDesign,
					PocketDesign: r.PocketDesign,
					SleeveDesign: r.SleeveDesign
				}
			}
			else {
				// already exists, so we need to consolidate this item into it
				if (r.FrontDesign) 
					r2[r.OrderNumber].FrontDesign = (r2[r.OrderNumber].FrontDesign == null ? "" : (r2[r.OrderNumber].FrontDesign + "<br>") ) +  r.FrontDesign
				if (r.BackDesign)
					r2[r.OrderNumber].BackDesign = (r2[r.OrderNumber].BackDesign == null ? "" : (r2[r.OrderNumber].BackDesign + "<br>") ) +  r.BackDesign
				if (r.PocketDesign)
					r2[r.OrderNumber].PocketDesign = (r2[r.OrderNumber].PocketDesign == null ? "" : (r2[r.OrderNumber].PocketDesign + "<br>") ) +  r.PocketDesign
				if (r.SleeveDesign)
					r2[r.OrderNumber].SleeveDesign = (r2[r.OrderNumber].SleeveDesign == null ? "" : (r2[r.OrderNumber].SleeveDesign + "<br>") ) +  r.SleeveDesign

				r2[r.OrderNumber].Qty += r.Qty
			}
		})

		const r2set = []
		for (r in r2)
			r2set.push(r2[r])

		res.render("outstanding/print.ejs", { name: "Print Designs",
			results: r2set})

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		if (db != null) 
			db.close()
	}


})

router.get("/outstanding/embroidery", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		const statement = db.prepare(`SELECT OrderNumber, OrderDate, DeliveryDate, BuyIn,
		Customer.Company, 
		fed.Code AS FrontDesign, 
		bed.Code AS BackDesign, 
		ped.Code AS PocketDesign, 
		sed.Code AS SleeveDesign,
		K0 + K1 + K2 + K4 + K6 + K8 + K10 + K12 + K14 + K16 + W6 + W8 + W10 + W12 + W14 + W16 + W18 + W20 + W22 + W24 + W26 + W28 + AXS + ASm + AM + AL + AXL + A2XL + A3XL + A4XL + A6XL + A7XL + A8XL AS Qty
		FROM Orders
		INNER JOIN Customer ON Customer.CustomerId=Orders.CustomerId
		INNER JOIN OrderGarment ON OrderGarment.OrderId=Orders.OrderId
		LEFT JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId=OrderGarment.FrontEmbroideryDesignId
		LEFT JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId=OrderGarment.BackEmbroideryDesignId
		LEFT JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=OrderGarment.PocketEmbroideryDesignId
		LEFT JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=OrderGarment.SleeveEmbroideryDesignId
		WHERE Done=0
		AND (NOT FrontDesign IS NULL OR NOT BackDesign IS NULL OR NOT PocketDesign IS NULL OR NOT SleeveDesign IS NULL)
		ORDER BY 2 ASC`)

		const resultset = statement.all()

		const r2 = {}

		resultset.forEach(r => {
			// if we don't already have it in r2, it's the first time we found it
			if (!r2[r.OrderNumber]) {
				r2[r.OrderNumber] = {
					OrderNumber: r.OrderNumber,
					OrderDate: r.OrderDate,
					DeliveryDate: r.DeliveryDate,
					BuyIn: r.BuyIn,
					Company: r.Company,
					Qty: r.Qty,
					FrontDesign: r.FrontDesign,
					BackDesign: r.BackDesign,
					PocketDesign: r.PocketDesign,
					SleeveDesign: r.SleeveDesign
				}
			}
			else {
				// already exists, so we need to consolidate this item into it
				if (r.FrontDesign) 
					r2[r.OrderNumber].FrontDesign = (r2[r.OrderNumber].FrontDesign == null ? "" : (r2[r.OrderNumber].FrontDesign + "<br>") ) +  r.FrontDesign
				if (r.BackDesign)
					r2[r.OrderNumber].BackDesign = (r2[r.OrderNumber].BackDesign == null ? "" : (r2[r.OrderNumber].BackDesign + "<br>") ) +  r.BackDesign
				if (r.PocketDesign)
					r2[r.OrderNumber].PocketDesign = (r2[r.OrderNumber].PocketDesign == null ? "" : (r2[r.OrderNumber].PocketDesign + "<br>") ) +  r.PocketDesign
				if (r.SleeveDesign)
					r2[r.OrderNumber].SleeveDesign = (r2[r.OrderNumber].SleeveDesign == null ? "" : (r2[r.OrderNumber].SleeveDesign + "<br>") ) +  r.SleeveDesign

				r2[r.OrderNumber].Qty += r.Qty
			}
		})

		const r2set = []
		for (r in r2)
			r2set.push(r2[r])

		res.render("outstanding/print.ejs", { name: "Embroidery Designs",
			results: r2set})

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		if (db != null) 
			db.close()
	}


})

router.get("/outstanding/transfer", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {

		const statement = db.prepare(`SELECT OrderNumber, OrderDate, DeliveryDate, BuyIn,
		Customer.Company, 
		ftd.Code AS FrontDesign, 
		btd.Code AS BackDesign, 
		ptd.Code AS PocketDesign, 
		std.Code AS SleeveDesign,
		K0 + K1 + K2 + K4 + K6 + K8 + K10 + K12 + K14 + K16 + W6 + W8 + W10 + W12 + W14 + W16 + W18 + W20 + W22 + W24 + W26 + W28 + AXS + ASm + AM + AL + AXL + A2XL + A3XL + A4XL + A6XL + A7XL + A8XL AS Qty
		FROM Orders
		INNER JOIN Customer ON Customer.CustomerId=Orders.CustomerId
		INNER JOIN OrderGarment ON OrderGarment.OrderId=Orders.OrderId
		LEFT JOIN TransferDesign ftd ON ftd.TransferDesignId=OrderGarment.FrontTransferDesignId
		LEFT JOIN TransferDesign btd ON btd.TransferDesignId=OrderGarment.BackTransferDesignId
		LEFT JOIN TransferDesign ptd ON ptd.TransferDesignId=OrderGarment.PocketTransferDesignId
		LEFT JOIN TransferDesign std ON std.TransferDesignId=OrderGarment.SleeveTransferDesignId
		WHERE Done=0
		AND (NOT FrontDesign IS NULL OR NOT BackDesign IS NULL OR NOT PocketDesign IS NULL OR NOT SleeveDesign IS NULL)
		ORDER BY 2 ASC`)

		const resultset = statement.all()

		const r2 = {}

		resultset.forEach(r => {
			// if we don't already have it in r2, it's the first time we found it
			if (!r2[r.OrderNumber]) {
				r2[r.OrderNumber] = {
					OrderNumber: r.OrderNumber,
					OrderDate: r.OrderDate,
					DeliveryDate: r.DeliveryDate,
					BuyIn: r.BuyIn,
					Company: r.Company,
					Qty: r.Qty,
					FrontDesign: r.FrontDesign,
					BackDesign: r.BackDesign,
					PocketDesign: r.PocketDesign,
					SleeveDesign: r.SleeveDesign
				}
			}
			else {
				// already exists, so we need to consolidate this item into it
				if (r.FrontDesign) 
					r2[r.OrderNumber].FrontDesign = (r2[r.OrderNumber].FrontDesign == null ? "" : (r2[r.OrderNumber].FrontDesign + "<br>") ) +  r.FrontDesign
				if (r.BackDesign)
					r2[r.OrderNumber].BackDesign = (r2[r.OrderNumber].BackDesign == null ? "" : (r2[r.OrderNumber].BackDesign + "<br>") ) +  r.BackDesign
				if (r.PocketDesign)
					r2[r.OrderNumber].PocketDesign = (r2[r.OrderNumber].PocketDesign == null ? "" : (r2[r.OrderNumber].PocketDesign + "<br>") ) +  r.PocketDesign
				if (r.SleeveDesign)
					r2[r.OrderNumber].SleeveDesign = (r2[r.OrderNumber].SleeveDesign == null ? "" : (r2[r.OrderNumber].SleeveDesign + "<br>") ) +  r.SleeveDesign

				r2[r.OrderNumber].Qty += r.Qty
			}
		})

		const r2set = []
		for (r in r2)
			r2set.push(r2[r])

		res.render("outstanding/print.ejs", { name: "Transfer Designs",
			results: r2set})

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.status(400)
	}
	finally {
		if (db != null) 
			db.close()
	}


})


/****************************************************************************** */


// POST for saving a new order
router.post("/", function (req, res) {

	db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	try {
		if (!req.body.OrderNumber) {
			res.statusMessage = "We require an order number"
			res.status(400).end()
			return
		}


		req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
		req.body.CreatedDateTime = req.body.LastModifiedDateTime = new Date().toLocaleString()
		req.body.Done= 0


		db.prepare("BEGIN TRANSACTION").run()

		let query = "INSERT INTO Orders (  "
		let columns = []
		for (let column in req.body) {
			if (req.body[column])
				columns.push(column)
		}
		columns.push("Done") // was missed by the "if(req.body[column])", database should have had a default 0 on this column
		query += columns.join(", ")
		query += " ) VALUES ( "
		const values = []
		for (let column of columns)
			values.push(`@${column}`)
		
		query += values.join(", ")
		query += " ) "
		let statement = db.prepare(query)
		let info = statement.run(req.body)
		console.log(info)
		req.body.OrderId = info.lastInsertRowid

		// now also insert it into SalesTotal
		//DeliveryDate is not in SalesTotal
		columns.splice(columns.indexOf("DeliveryDate"), 1)
		const salesTotalCols = columns.filter(c => c != "CreatedBy" && c != "CreatedDateTime" && c != "LastModifiedBy" && c != "LastModifiedDateTime")
		salesTotalCols.unshift("OrderId")
		query = `INSERT INTO SalesTotal (
			${salesTotalCols.join(", ")}
		) VALUES (
			${salesTotalCols.map(c => `@${c}`).join()}
		)`
		info = db.prepare(query).run(req.body)


		db.prepare("COMMIT").run()

		res.json({
			message: "success",
			id: req.body.OrderId
		}).end()

		// now add it to AuditLog
		try {
			db.prepare("BEGIN TRANSACTION").run()
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Orders", info.lastInsertRowid, "INS", req.body.CreatedBy, req.body.CreatedDateTime)

			// now add it to AuditLogEntry
			for (col of columns) {
				if (col.startsWith("Created") || col.startsWith("LastM"))
					continue
				statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, NewValue) VALUES(?, ?, ?)")
				statement.run(info.lastInsertRowid, col, req.body[col])
			}
			db.prepare("COMMIT").run()


		}
		catch (ex) {
			db.prepare("ROLLBACK").run()
			// do nothing, because the response has already ended. 
			// if we threw the error, then it would be caught and the .end() would have been called twice
		}

	}
	catch (ex) {

		db.prepare(`ROLLBACK;`).run()

		res.statusMessage = ex.message
		res.sendStatus(400).end();
	}
	finally {
		db.close()
	}
})


// POST garment details for the order id
// if it is already in the table, it's an update, otherwise it's an insert
router.post("/:id/garment", function (req, res) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {

		const date = new Date().toLocaleString()

		if (req.body.OrderGarmentId > 0) {
			// mode = "update"

			const myOrderGarment = db.prepare("SELECT OrderGarment.*, Orders.BuyIn FROM OrderGarment INNER JOIN Orders ON OrderGarment.OrderId=Orders.OrderId WHERE OrderGarmentId=?").get(req.body.OrderGarmentId)
			req.body.LastModifiedBy = req.auth.user
			req.body.LastModifiedDateTime = date
			const columns = ["LastModifiedBy", "LastModifiedDateTime"]
			if (req.body.Price != myOrderGarment.Price)
				columns.push("Price")

			// add all sizes into req.body and set to 0
			for (size of sz.allSizes) {
				req.body[size] = 0
			}
			//set any size quantities to the top level of the request body, it's used to pass to statement.run
			for (const q in req.body.quantities) {
				if (req.body.quantities[q]) {
					const dbQty = `${req.body.sizeCategory[0]}${q}` // eg "A" for adults, "K" for kids
					req.body[dbQty] = req.body.quantities[q]
				}
			}
			// find any size quantities that have changed
			const changedSizes = []
			for (const size of sz.allSizes) {
				if (req.body[size] != myOrderGarment[size])
					changedSizes.push(size)
			}
			columns.push(...changedSizes)

			// iterate the designs and locations
			// if we find something has changed, add to the columns array, and to the req.body
			const designs = [{ type: "Print", medium: "Screen" }, { type: "Embroidery", medium: "Usb" }, { type: "Transfer", medium: "TransferName" }]
			for (const design of designs) {
				for (const location in req.body[`checked${design.medium}s`]) {
					if (req.body[`checked${design.medium}s`][location].length > 0) {
						if (myOrderGarment[`${location}${design.type}DesignId`] != req.body[`${design.type.toLowerCase()}DesignId`]) {
							columns.push(`${location}${design.type}DesignId`)
							req.body[`${location}${design.type}DesignId`] = req.body[`${design.type.toLowerCase()}DesignId`]
						}
					}
					if (req.body[`checked${design.medium}s`][location].length == 0) {
						if (myOrderGarment[`${location}${design.medium}Id`] != null) {
							columns.push(`${location}${design.medium}Id`)
							req.body[`${location}${design.medium}Id`] = null
						}
						if (myOrderGarment[`${location}${design.medium}2Id`] != null) {
							columns.push(`${location}${design.medium}2Id`)
							req.body[`${location}${design.medium}2Id`] = null
						}
					}
					else if (req.body[`checked${design.medium}s`][location].length == 1) {
						if (myOrderGarment[`${location}${design.medium}Id`] != req.body[`checked${design.medium}s`][location][0]) {
							columns.push(`${location}${design.medium}Id`)
							req.body[`${location}${design.medium}Id`] = req.body[`checked${design.medium}s`][location][0]
						}
						if (myOrderGarment[`${location}${design.medium}2Id`] != null) {
							columns.push(`${location}${design.medium}2Id`)
							req.body[`${location}${design.medium}2Id`] = null
						}
					}
					else if (req.body[`checked${design.medium}s`][location].length == 2) {
						if (myOrderGarment[`${location}${design.medium}Id`] != req.body[`checked${design.medium}s`][location][0]) {
							columns.push(`${location}${design.medium}Id`)
							req.body[`${location}${design.medium}Id`] = req.body[`checked${design.medium}s`][location][0]
						}
						if (myOrderGarment[`${location}${design.medium}2Id`] != req.body[`checked${design.medium}s`][location][1]) {
							columns.push(`${location}${design.medium}2Id`)
							req.body[`${location}${design.medium}2Id`] = req.body[`checked${design.medium}s`][location][1]
						}
					}
				}
			}

			if (columns.length == 2) {
				// nothing has changed
				res.statusMessage = "We couldn't find any changes to save"
				res.sendStatus(400).end()
				return
			}

			db.prepare("BEGIN TRANSACTION").run()


			let query = `UPDATE OrderGarment SET ${columns.map(c => ` ${c}=@${c} `).join(", ")} WHERE OrderGarmentId=@OrderGarmentId`
			let statement = db.prepare(query)
			let info = statement.run(req.body)
			console.log(info)

			// update the Sales table, no auditing or logging
			mySale = db.prepare("SELECT 1 FROM Sales WHERE OrderGarmentId=?").get(req.body.OrderGarmentId)
			salesCols = columns.filter(c => c != "LastModifiedBy" && c != "LastModifiedDateTime" )
			if (mySale) {
				query = ` UPDATE Sales SET ${ salesCols.map(c => ` ${c}=@${c} `).join(", ") }  WHERE OrderGarmentId=@OrderGarmentId `
				info = db.prepare(query).run(req.body)
			}
			else {
				// in case it's not in the sales table, we'll update it by OrderId and GarmentId
				// this is not great because an order might have the same garment multiple times, but it should only be a potential problem during the transition period
				query = ` UPDATE Sales SET ${ salesCols.map(c => ` ${c}=@${c} `).join(", ") }  WHERE OrderId=@OrderId & GarmentId=@GarmentId `
				info = db.prepare(query).run(req.body)
			}
			console.log(info)
			// NOTE we should probably update SalesTotal.TotalQuantity and SalesTotal.TotalValue, 
			// but we prefer to do that on the fly when using the Sales page


			// remove from garment stock order levels
			let myGarment = null
			if (changedSizes.length > 0) {
				myGarment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(req.body.GarmentId)
				query = `UPDATE Garment SET 
	${changedSizes.map(c => ` ${c}=${c} - ( @${c} - ${myOrderGarment[c]}) `).join(", ")}
	WHERE GarmentId = @GarmentId `
				statement = db.prepare(query)
				info = statement.run(req.body)
				console.log(info)
			}
			db.prepare("COMMIT").run()

			if (myOrderGarment.BuyIn) {
				const warnings = getWarnings(db, myOrderGarment.GarmentId)

				if (warnings.length == 0) {
					res.send({ message: "ok" }).end()
				}
				else {
					res.send({ warnings }).end()
				}
			}
			else {
				res.send({ message: "ok" }).end()
			}

			try {
				db.prepare("BEGIN TRANSACTION").run()
				// add the update to AuditLog
				statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
				info = statement.run("OrderGarment", req.body.OrderGarmentId, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)

				// add the insert to AuditLogEntry
				for (col of columns) {
					if (col.startsWith("LastM"))
						continue
					statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
					statement.run(info.lastInsertRowid, col, myOrderGarment[col], req.body[col])
				}

				// if there are any changes sizes, add the update to AuditLog for Garment
				if (changedSizes.length > 0) {
					statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
					info = statement.run("Garment", req.body.GarmentId, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)

					// add the insert to AuditLogEntry
					for (size of changedSizes) {
						statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
						statement.run(info.lastInsertRowid, size, myGarment[size], myGarment[size] - (req.body[size] - myOrderGarment[size]))
					}
				}

				db.prepare("COMMIT").run()
			}
			catch (ex) {
				console.log(ex)
				db.prepare("ROLLBACK").run()
			}


		} // end mode = update


		else {
			// mode = "insert"
			req.body.CreatedBy = req.body.LastModifiedBy = req.auth.user
			req.body.CreatedDateTime = req.body.LastModifiedDateTime = date
			const columns = ["GarmentId", "OrderId", "Price", "CreatedBy", "CreatedDateTime", "LastModifiedBy", "LastModifiedDateTime"]
			const quantities = []

			// add quantity columns where the body value is more than 0
			for (const q in req.body.quantities) {
				if (req.body.quantities[q]) {
					const dbQty = `${req.body.sizeCategory[0]}${q}`
					columns.push(dbQty)
					quantities.push(dbQty)
					req.body[dbQty] = req.body.quantities[q]
				}
			}

			// in each locations, if we have a checked screen for it, add it into the table
			for (loc of sz.locations) {
				// print/screen
				if (req.body.checkedScreens) {
					if (req.body.checkedScreens[loc].length > 0) {
						columns.push(`${loc}PrintDesignId`)
						req.body[`${loc}PrintDesignId`] = req.body.printDesignId

						columns.push(`${loc}ScreenId`)
						req.body[`${loc}ScreenId`] = req.body.checkedScreens[loc][0]

						if (req.body.checkedScreens[loc].length == 2) {
							columns.push(`${loc}Screen2Id`)
							req.body[`${loc}Screen2Id`] = req.body.checkedScreens[loc][1]
						}
					}
				}
				// transfer
				if (req.body.checkedTransferNames) {
					if (req.body.checkedTransferNames[loc].length > 0) {
						columns.push(`${loc}TransferDesignId`)
						req.body[`${loc}TransferDesignId`] = req.body.transferDesignId

						columns.push(`${loc}TransferNameId`)
						req.body[`${loc}TransferNameId`] = req.body.checkedTransferNames[loc][0]

						if (req.body.checkedTransferNames[loc].length == 2) {
							columns.push(`${loc}TransferName2Id`)
							req.body[`${loc}TransferName2Id`] = req.body.checkedTransferNames[loc][1]
						}
					}
				}
				// embroidery / usb
				if (req.body.checkedUsbs && req.body.checkedUsbs[loc].length > 0) {
					columns.push(`${loc}EmbroideryDesignId`)
					req.body[`${loc}EmbroideryDesignId`] = req.body.embroideryDesignId

					columns.push(`${loc}UsbId`)
					req.body[`${loc}UsbId`] = req.body.checkedUsbs[loc][0]

					if (req.body.checkedUsbs[loc].length == 2) {
						columns.push(`${loc}Usb2Id`)
						req.body[`${loc}Usb2Id`] = req.body.checkedUsbs[loc][1]
					}
				}

			}
			db.prepare("BEGIN TRANSACTION").run()

			let query = `INSERT INTO OrderGarment (
${columns.join(", ")}
) VALUES ( 
${columns.map(c => ` @${c} `).join(", ")}
)`
			let statement = db.prepare(query)
			let info = statement.run(req.body)
			console.log(info)
			const orderGarmentId = info.lastInsertRowid
			req.body.OrderGarmentId = orderGarmentId

			// remove from garment stock order levels
			const myGarment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").run(req.body.GarmentId)
			query = `UPDATE Garment SET 
${quantities.map(q => ` ${q}=${q} - @${q} `).join(", ")}
WHERE GarmentId = @GarmentId `
			statement = db.prepare(query)
			info = statement.run(req.body)
			console.log(info)


			// add it to the Sales table
			const salesCols = columns.filter(c => c != "CreatedBy" && c!= "CreatedDateTime" && c != "LastModifiedBy" && c != "LastModifiedDateTime" )
			salesCols.push("OrderGarmentId")
			query = `INSERT INTO Sales (${salesCols.join(", ")}) VALUES (${salesCols.map(c => ` @${c} `).join(", ")}) `
			info = db.prepare(query).run(req.body)
			console.log(info)



			db.prepare("COMMIT").run()

			const myOrder = db.prepare("SELECT * FROM Orders WHERE OrderId=?").get(req.body.OrderId)
			if (myOrder.BuyIn) {
				const warnings = getWarnings(db, req.body.GarmentId)
				if (warnings.length > 0) {
					res.send({
						warnings,
						OrderGarmentId: orderGarmentId
					}).end()
				}
				else {
					res.send({ OrderGarmentId: orderGarmentId }).end()
				}
			}
			else {
				res.send({ OrderGarmentId: orderGarmentId }).end()
			}

			try {
				db.prepare("BEGIN TRANSACTION").run()
				// add the insert to AuditLog
				statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
				info = statement.run("OrderGarment", orderGarmentId, "INS", req.body.CreatedBy, req.body.CreatedDateTime)

				// add the insert to AuditLogEntry
				for (col of columns) {
					if (col.startsWith("Created") || col.startsWith("LastM"))
						continue
					statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, NewValue) VALUES(?, ?, ?)")
					statement.run(info.lastInsertRowid, col, req.body[col])
				}
				// add the update to AuditLog
				statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
				info = statement.run("Garment", req.body.GarmentId, "UPD", req.body.CreatedBy, req.body.CreatedDateTime)

				// add the insert to AuditLogEntry
				for (q of quantities) {
					statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
					statement.run(info.lastInsertRowid, q, myGarment[q], myGarment[q] - req.body[q])
				}

				db.prepare("COMMIT").run()
			}
			catch (ex) {
				console.log(ex)
				db.prepare("ROLLBACK").run()
			}


		} // end mode = insert


	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		console.log(ex.message)
		db.prepare("ROLLBACK").run()
	}
	finally {
		db.close()
	}

})



/*************************************************************************** */


// PUT for saving changes to an order
router.put("/:id", function (req, res) {

	let db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		if (!req.body.OrderNumber) {
			res.statusMessage = "We require an order number"
			res.status(400).end()
			return
		}

		req.body.OrderId = req.params.id

		req.body.LastModifiedBy = req.auth.user
		req.body.LastModifiedDateTime = new Date().toLocaleString()

		db.prepare("BEGIN TRANSACTION").run()

		const myOrder = db.prepare("SELECT * FROM Orders WHERE OrderId=?").get(req.params.id)

		let query = "UPDATE Orders SET "
		const changedColumns = []
		for (const col in req.body)
			if (req.body[col] != myOrder[col])
				changedColumns.push(col)

		query += changedColumns.map(c => ` ${c}=@${c} `).join(", ")
		query += " WHERE OrderId=@OrderId "

		let statement = db.prepare(query)
		let info = statement.run(req.body)
		console.log(info)


		// we now must also update the SalesTotal table -- no audit columns or logs
		query = `UPDATE SalesTotal SET ${changedColumns.filter(c => c != "LastModifiedBy" && c != "LastModifiedDateTime").map(c => ` ${c}=@${c} `).join(", ")} WHERE OrderId=@OrderId `
		info = db.prepare(query).run(req.body)
		console.log(info)

		db.prepare("COMMIT").run()


		res.json({
			message: "success",
		}).end()

		// now add it to audit logs
		try {
			db.prepare("BEGIN TRANSACTION").run()

			// insert into AuditLog
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			const info = statement.run("Orders", req.params.id, "UPD", req.body.LastModifiedBy, req.body.LastModifiedDateTime)

			// insert into AuditLogEntry
			for (var col of changedColumns) {
				if (col.startsWith("LastM")) {
					continue
				}
				statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
				statement.run(info.lastInsertRowid, col, myOrder[col], req.body[col])
			}

			db.prepare("COMMIT").run()
		}
		catch (ex) {
			db.prepare("ROLLBACK").run()
			// do nothing, because the response has already ended. 
			// if we threw the error, then it would be caught and the .end() would have been called twice
		}



	}
	catch (err) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		db.prepare("ROLLBACK").run()
	}
	finally {
		db.close()
	}


})


// PUT  'ship' an order 
// set set invoice date and processed date if not already

router.put("/ship/:id", function (req, res) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare(`SELECT * FROM Orders WHERE OrderId=?`)
		const order = statement.get(req.params.id)

		const date = new Date().toLocaleString()
		let params = {
			LastModifiedBy: req.auth.user,
			LastModifiedDateTime: date,
			InvoiceDate: new Date().toISOString().slice(0, 10),
			ProcessedDate: new Date().toISOString().slice(0, 10)
		}


		let query = ` UPDATE Orders SET ${Object.keys(params).map(p => ` ${p}=@${p} `).join(", ")} `
		params.OrderId = req.params.id
		query += " WHERE OrderId=@OrderId "

		statement = db.prepare(query)
		let info = statement.run(params)
		console.log(info)

		delete params.LastModifiedBy
		delete params.LastModifiedDateTime

		// add to audit logs
		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Orders", req.params.id, "UPD", req.auth.user, date)
		console.log(info)
		const auditLogId = info.lastInsertRowid
		delete params.OrderId
		delete params.LastModifiedBy
		delete params.LastModifiedDateTime
		for (const param in params) {
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
			info = statement.run(auditLogId, param, order[param], params[param])
			console.log(info)
		}

		//update fields in the SalesTotal table
		// TODO sometimes salesTotalParams is null
		const salesTotalParams = { 
			DateInvoiced: params.InvoiceDate,
			DateProcessed: params.ProcessedDate
		}
		query = ` UPDATE SalesTotal SET ${Object.keys(salesTotalParams).map(p => ` ${p}=@${p} `).join(", ")} WHERE OrderId=@OrderId `
		salesTotalParams.OrderId = req.params.id
		info = db.prepare(query).run(salesTotalParams)
		console.log(info)



		db.prepare("COMMIT").run()

		res.send("ok").end()

	}
	catch (ex) {
		db.prepare(`ROLLBACK`).run()
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}
})





// PUT  mark an order as done
// set Done to "1" (that is, true)
// set set invoice date and processed date if not already

router.put("/done/:id", function (req, res) {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare(`SELECT * FROM Orders WHERE OrderId=?`)
		const order = statement.get(req.params.id)

		const date = new Date().toLocaleString()
		let params = {
			Done: 1,
			LastModifiedBy: req.auth.user,
			LastModifiedDateTime: date
		}

		let query = ` UPDATE Orders SET ${Object.keys(params).map(p => ` ${p}=@${p} `).join(", ")} `
		params.OrderId = req.params.id
		query += " WHERE OrderId=@OrderId "

		statement = db.prepare(query)
		let info = statement.run(params)
		console.log(info)

		delete params.LastModifiedBy
		delete params.LastModifiedDateTime

		// add to audit logs
		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Orders", req.params.id, "UPD", req.auth.user, date)
		console.log(info)
		const auditLogId = info.lastInsertRowid
		delete params.OrderId
		delete params.LastModifiedBy
		delete params.LastModifiedDateTime
		for (const param in params) {
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
			info = statement.run(auditLogId, param, order[param], params[param])
			console.log(info)
		}

		//update fields in the SalesTotal table
		query = ` UPDATE SalesTotal SET Done=1 WHERE OrderId=? `
		info = db.prepare(query).run(req.params.id)
		console.log(info)



		db.prepare("COMMIT").run()

		res.send("ok").end()

	}
	catch (ex) {
		db.prepare(`ROLLBACK`).run()
		res.statusMessage = ex.message
		res.status(400).end()
	}
	finally {
		db.close()
	}
})



// PUT to undelete an order, also adds it back to SalesTotal
router.put("/restore/:id", (req, res) => {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		db.prepare("BEGIN TRANSACTION").run()

		const date = new Date().toLocaleString()
		let statement = db.prepare("UPDATE Orders SET Deleted=0, LastModifiedBy=?, LastModifiedDateTime=? WHERE OrderId=?")
		let info = statement.run(req.auth.user, date, req.params.id)
		console.log(info)

		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Order", req.params.id, "UPD", req.auth.user, date)

		statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES (?, ?, ?, ?)")
		info = statement.run(info.lastInsertRowid, "Deleted", 1, 0)

		// add it to the SalesTotal table
		const myOrder = db.prepare("SELECT * FROM Orders WHERE OrderId=?").get(req.params.id)
		statement = db.prepare(`INSERT INTO SalesTotal (
OrderId, OrderNumber, CustomerId, SalesRep, OrderDate, Repeat, New, BuyIn, Terms, Delivery, Notes, CustomerOrderNumber, 
Company, DateProcessed, DateInvoiced, InvoiceNumber, Done
) VALUES ( 
@OrderId, @OrderNumber, @CustomerId, @SalesRep, @OrderDate, @Repeat, @New, @BuyIn, @Terms, @DeliveryDate, @Notes, @CustomerOrderNumber,
@Company, @ProcessedDate, @InvoiceDate, @InvoiceNumber, @Done)`)		
		info = statement.run(myOrder)


		db.prepare("COMMIT").run()

		res.send("ok")

	}
	catch(err) {
		console.log(err)
		db.prepare("ROLLBACK").run()
		res.statusMessage = err.message
		res.status(400).end()
	}
	finally {
		db.close()
	}

})



/****************************************************************************** */


// DELETE the order with the id
router.delete("/:id", function (req, res) {

	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })
	const date = new Date().toLocaleString()

	try {

		// just in case, we check this, should never happen, UI should not allow it, you can only view deleted=0 in the table
		let statement = db.prepare(`SELECT * FROM Orders WHERE OrderId=?`)
		const myOrder = statement.get(req.params.id)
		if (myOrder.Done == 1) {
			req.statusMessage = "We can't delete the order because it has already been shipped."
			req.status(400).end()
			return
		}

		db.prepare("BEGIN TRANSACTION").run()

		// job 1 delete related items in OrderGarment, restoring stock levels as we go
		const orderGarments = db.prepare("SELECT * FROM OrderGarment WHERE OrderId=?").all(req.params.id)
		for (const orderGarment of orderGarments) {

			// get the original garment, we need this at the end to help update the audit log
			const myGarment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(orderGarment.GarmentId)

			let query = "DELETE FROM OrderGarment WHERE OrderGarmentId=?"
			statement = db.prepare(query)
			let info = statement.run(orderGarment.OrderGarmentId)
			console.log(info)

			// remove also from Sales table
			// first check if we have order garment id, we don't have them for all
			const mySale = db.prepare("SELECT 1 FROM Sales WHERE OrderGarmentId=?").get(orderGarment.OrderGarmentId)
			if (mySale) {
				info = db.prepare("DELETE FROM Sales WHERE OrderGarmentId=?").run(orderGarment.OrderGarmentId)
				console.log(info)
			}
			else {
				info = db.prepare("DELETE FROM Sales WHERE OrderId=? AND GarmentId=?").run(req.params.id, myGarment.GarmentId)
				console.log(info)
			}

			// add the delete to AuditLog
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("OrderGarment", orderGarment.OrderGarmentId, "DEL", req.auth.user, date)
			console.log(info)
			// add the delete items to AuditLogEntry
			for (key in orderGarment) {
				statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue) VALUES(?, ?, ?)") // new value is null
				if (key != "OrderGarmentId" && !key.startsWith("Created") && !key.startsWith("LastM") && orderGarment[key])
					statement.run(info.lastInsertRowid, key, orderGarment[key])
			}

			// add the stock values back into the garment inventory
			const sizeChanges = []
			for (const size of sz.allSizes) {
				if (orderGarment[size]) {
					sizeChanges.push({ size, amount: orderGarment[size] })
				}
			}
			if (sizeChanges.length > 0) {
				const query = `UPDATE Garment SET 
	${sizeChanges.map(s => ` ${s.size} = ${s.size} + @${s.size} `).join(", ")} 
	 , LastModifiedBy=@LastModifiedBy, LastModifiedDateTime=@LastModifiedDateTime
	 WHERE GarmentId=@GarmentId`
				statement = db.prepare(query)

				const params = {  // will be passed into run()
					GarmentId: orderGarment.GarmentId,
					LastModifiedBy: req.auth.user,
					LastModifiedDateTime: date
				}
				for (sizeChange of sizeChanges) {
					params[sizeChange.size] = sizeChange.amount
				}

				info = statement.run(params)
				console.log(info)

				// add the garment updates to AuditLog
				statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
				info = statement.run("Garment", orderGarment.GarmentId, "UPD", req.auth.user, date)
				console.log(info)
				// add the changes to AuditLogEntry


				for (sizeChange of sizeChanges) {
					if (myGarment) { // i once noticed this was undefined while debugging, no idea how that can happen, but we better make sure
						statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
						statement.run(info.lastInsertRowid, sizeChange.size, myGarment[sizeChange.size], myGarment[sizeChange.size] + sizeChange.amount)
					}
				}
			}
		} // end for orderGarment

		// job 2, delete the order
		statement = db.prepare("UPDATE Orders SET Deleted=1 WHERE OrderId=?")
		info = statement.run(req.params.id)
		console.log(info)

		// add the soft delete to audit log
		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("Orders", req.params.id, "DEL", req.auth.user, date)
		console.log(info)

		// job 3, delete the order from SalesTotal and Sales
		// these are neither audited, nor soft deleted
		info = db.prepare("DELETE FROM Sales WHERE OrderId=?").run(req.params.id)
		console.log(info)
		info = db.prepare("DELETE FROM SalesTotal WHERE OrderId=?").run(req.params.id)
		console.log(info)



		db.prepare("COMMIT").run()
		res.send("ok").end()

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		db.prepare("ROLLBACK").run()
	}
	finally {
		db.close()
	}
})


// DELETE take a garment off an order
router.delete("/garment/:orderGarmentId", (req, res) => {
	const db = new Database("sunprints.db", { verbose: console.log, fileMustExist: true })

	try {
		db.prepare("BEGIN TRANSACTION").run()

		let statement = db.prepare("SELECT * FROM OrderGarment WHERE OrderGarmentId=?")
		const myOrderGarment = statement.get(req.params.orderGarmentId)

		statement = db.prepare("DELETE FROM OrderGarment WHERE OrderGarmentId=?")
		let info = statement.run(req.params.orderGarmentId)
		console.log(info)

		//also remove it from sales, no auditing here
		const mySale = db.prepare("SELECT 1 FROM Sales WHERE OrderGarmentId=?").get(req.params.orderGarmentId)
		if (mySale) {
			info = db.prepare("DELETE FROM Sales WHERE OrderGarmentId=? ").run(req.params.orderGarmentId)
			console.log(info)
		}
		else {
			info = db.prepare("DELETE FROM Sales WHERE OrderId=? AND GarmentId=?").run(myOrderGarment.OrderId, myOrderGarment.GarmentId)
			console.log(info)
		}

		const date = new Date().toLocaleString()

		// add the delete to AuditLog
		statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
		info = statement.run("OrderGarment", req.params.orderGarmentId, "DEL", req.auth.user, date)

		// add the insert to AuditLogEntry
		for (key in myOrderGarment) {
			statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue) VALUES(?, ?, ?)")
			if (key != "OrderGarmentId" && !key.startsWith("Created") && !key.startsWith("LastM") && myOrderGarment[key])
				statement.run(info.lastInsertRowid, key, myOrderGarment[key])
		}

		// add the stock values back into the garment inventory
		const sizeChanges = []
		for (size of sz.allSizes) {
			if (myOrderGarment[size]) {
				sizeChanges.push({ size, amount: myOrderGarment[size] })
			}
		}
		if (sizeChanges.length > 0) {
			const query = `UPDATE Garment SET 
${sizeChanges.map(s => ` ${s.size} = ${s.size} + @${s.size} `).join(", ")} 
 , LastModifiedBy=@LastModifiedBy, LastModifiedDateTime=@LastModifiedDateTime
 WHERE GarmentId=@GarmentId`
			statement = db.prepare(query)

			const params = {  // will be passed into run()
				GarmentId: myOrderGarment.GarmentId,
				LastModifiedBy: req.auth.user,
				LastModifiedDateTime: date
			}
			for (sizeChange of sizeChanges) {
				params[sizeChange.size] = sizeChange.amount
			}

			info = statement.run(params)

			// add the garment updates to AuditLog
			statement = db.prepare("INSERT INTO AuditLog (ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime) VALUES(?, ?, ?, ?, ?)")
			info = statement.run("Garment", myOrderGarment.GarmentId, "UPD", req.auth.user, date)

			// add the changes to AuditLogEntry
			const myGarment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(myOrderGarment.GarmentId)
			for (sizeChange of sizeChanges) {
				statement = db.prepare("INSERT INTO AuditLogEntry (AuditLogId, PropertyName, OldValue, NewValue) VALUES(?, ?, ?, ?)")
				statement.run(info.lastInsertRowid, sizeChange.size, myGarment[sizeChange.size], myGarment[sizeChange.size] + sizeChange.amount)
			}
		}

		res.send("ok").end()
		db.prepare("COMMIT").run()

	}
	catch (ex) {
		res.statusMessage = ex.message
		res.sendStatus(400).end()
		db.prepare("ROLLBACK").run()
	}
	finally {
		db.close()
	}
})


function getWarnings(db, garmentId) {
	// return balance warnings
	const sizeTerms = []
	for (const size of sz.allSizes) {
		sizeTerms.push(`${size}, Min${size}`)
	}
	const query = `SELECT ${sizeTerms.join(", ")} FROM Garment WHERE GarmentId = ?`
	const statement = db.prepare(query)
	const garment = statement.get(garmentId)
	const warnings = []
	for (const size of sz.allSizes) {
		if (garment[size] - garment[`Min${size}`] < 0) {
			warnings.push({
				size,
				min: garment[`Min${size}`],
				current: garment[size]
			})
		}
	}
	return warnings

}

function getDesigns(db, orderid) {

	let statement = db.prepare(`SELECT  
	FrontPrintDesignId, BackPrintDesignId, PocketPrintDesignId, SleevePrintDesignId,
	 IFNULL(ScreenFront1.Number,  '') AS ScreenFront1Number,  IFNULL(ScreenFront1.Name, '')  AS ScreenFront1Name,  IFNULL(ScreenFront1.Colour, '') AS ScreenFront1Colour
	,IFNULL(ScreenFront2.Number,  '') AS ScreenFront2Number,  IFNULL(ScreenFront2.Name, '')  AS ScreenFront2Name,  IFNULL(ScreenFront2.Colour, '') AS ScreenFront2Colour
	,IFNULL(ScreenBack1.Number,   '') AS ScreenBack1Number,   IFNULL(ScreenBack1.Name, '')   AS ScreenBack1Name,   IFNULL(ScreenBack1.Colour, '') AS ScreenBack1Colour
	,IFNULL(ScreenBack2.Number,   '') AS ScreenBack2Number,   IFNULL(ScreenBack2.Name, '')   AS ScreenBack2Name,   IFNULL(ScreenBack2.Colour, '') AS ScreenBack2Colour
	,IFNULL(ScreenPocket1.Number, '') AS ScreenPocket1Number, IFNULL(ScreenPocket1.Name, '') AS ScreenPocket1Name, IFNULL(ScreenPocket1.Colour, '') AS ScreenPocket1Colour
	,IFNULL(ScreenPocket2.Number, '') AS ScreenPocket2Number, IFNULL(ScreenPocket2.Name, '') AS ScreenPocket2Name, IFNULL(ScreenPocket2.Colour, '') AS ScreenPocket2Colour
	,IFNULL(ScreenSleeve1.Number, '') AS ScreenSleeve1Number, IFNULL(ScreenSleeve1.Name, '') AS ScreenSleeve1Name, IFNULL(ScreenSleeve1.Colour, '') AS ScreenSleeve1Colour
	,IFNULL(ScreenSleeve2.Number, '') AS ScreenSleeve2Number, IFNULL(ScreenSleeve2.Name, '') AS ScreenSleeve2Name, IFNULL(ScreenSleeve2.Colour, '') AS ScreenSleeve2Colour
	,IFNULL(UsbFront1.Number, '')  AS UsbFront1Number,  IFNULL(UsbFront1.Notes, '')  AS UsbFront1Notes
	,IFNULL(UsbFront2.Number, '')  AS UsbFront2Number,  IFNULL(UsbFront2.Notes, '')  AS UsbFront2Notes
	,IFNULL(UsbBack1.Number, '')   AS UsbBack1Number,   IFNULL(UsbBack1.Notes, '')   AS UsbBack1Notes
	,IFNULL(UsbBack2.Number, '')   AS UsbBack2Number,   IFNULL(UsbBack2.Notes, '')   AS UsbBack2Notes
	,IFNULL(UsbPocket1.Number, '') AS UsbPocket1Number, IFNULL(UsbPocket1.Notes, '') AS UsbPocket1Notes
	,IFNULL(UsbPocket2.Number, '') AS UsbPocket2Number, IFNULL(UsbPocket2.Notes, '') AS UsbPocket2Notes
	,IFNULL(UsbSleeve1.Number, '') AS UsbSleeve1Number, IFNULL(UsbSleeve1.Notes, '') AS UsbSleeve1Notes
	,IFNULL(UsbSleeve2.Number, '') AS UsbSleeve2Number, IFNULL(UsbSleeve2.Notes, '') AS UsbSleeve2Notes
	,IFNULL(TransferNameFront1.Name, '')  AS TransferNameFront1Name
	,IFNULL(TransferNameFront2.Name, '')  AS TransferNameFront2Name
	,IFNULL(TransferNameBack1.Name, '')   AS TransferNameBack1Name
	,IFNULL(TransferNameBack2.Name, '')   AS TransferNameBack2Name
	,IFNULL(TransferNamePocket1.Name, '') AS TransferNamePocket1Name
	,IFNULL(TransferNamePocket2.Name, '') AS TransferNamePocket2Name
	,IFNULL(TransferNameSleeve1.Name, '') AS TransferNameSleeve1Name
	,IFNULL(TransferNameSleeve2.Name, '') AS TransferNameSleeve2Name,
	Garment.SizeCategory AS SizeCategory
	FROM OrderGarment
	LEFT JOIN Screen AS ScreenFront1  ON  ScreenFront1.ScreenId=FrontScreenId
	LEFT JOIN Screen AS ScreenFront2  ON  ScreenFront2.ScreenId=FrontScreen2Id
	LEFT JOIN Screen AS ScreenBack1   ON   ScreenBack1.ScreenId=BackScreenId
	LEFT JOIN Screen AS ScreenBack2   ON   ScreenBack2.ScreenId=BackScreen2Id
	LEFT JOIN Screen AS ScreenPocket1 ON ScreenPocket1.ScreenId=PocketScreenId
	LEFT JOIN Screen AS ScreenPocket2 ON ScreenPocket2.ScreenId=PocketScreen2Id
	LEFT JOIN Screen AS ScreenSleeve1 ON ScreenSleeve1.ScreenId=SleeveScreenId
	LEFT JOIN Screen AS ScreenSleeve2 ON ScreenSleeve2.ScreenId=SleeveScreen2Id
	LEFT JOIN Usb AS UsbFront1  ON UsbFront1.UsbId =FrontUsbId
	LEFT JOIN Usb AS UsbFront2  ON UsbFront2.UsbId =FrontUsb2Id
	LEFT JOIN Usb AS UsbBack1   ON UsbBack1.UsbId  =BackUsbId
	LEFT JOIN Usb AS UsbBack2   ON UsbBack2.UsbId  =BackUsb2Id
	LEFT JOIN Usb AS UsbPocket1 ON UsbPocket1.UsbId=PocketUsbId
	LEFT JOIN Usb AS UsbPocket2 ON UsbPocket2.UsbId=PocketUsb2Id
	LEFT JOIN Usb AS UsbSleeve1 ON UsbSleeve1.UsbId=SleeveUsbId
	LEFT JOIN Usb AS UsbSleeve2 ON UsbSleeve2.UsbId=SleeveUsb2Id
	LEFT JOIN TransferName AS TransferNameFront1  ON  TransferNameFront1.TransferNameId=FrontTransferNameId
	LEFT JOIN TransferName AS TransferNameFront2  ON  TransferNameFront2.TransferNameId=FrontTransferName2Id
	LEFT JOIN TransferName AS TransferNameBack1   ON   TransferNameBack1.TransferNameId=BackTransferNameId
	LEFT JOIN TransferName AS TransferNameBack2   ON   TransferNameBack2.TransferNameId=BackTransferName2Id
	LEFT JOIN TransferName AS TransferNamePocket1 ON TransferNamePocket1.TransferNameId=PocketTransferNameId
	LEFT JOIN TransferName AS TransferNamePocket2 ON TransferNamePocket2.TransferNameId=PocketTransferName2Id
	LEFT JOIN TransferName AS TransferNameSleeve1 ON TransferNameSleeve1.TransferNameId=SleeveTransferNameId
	LEFT JOIN TransferName AS TransferNameSleeve2 ON TransferNameSleeve2.TransferNameId=SleeveTransferName2Id
	INNER JOIN Garment ON Garment.GarmentId=OrderGarment.GarmentId
	WHERE OrderId=?
		`)

	const results = statement.all(orderid)
	const transfers = {}
	const usbs = {}
	const screens = {}

	sz.locations.forEach(loc => {
		screens[loc] = []
		usbs[loc] = []
		transfers[loc] = []
	})

	results.forEach(r => {
		sz.locations.forEach(loc => {
			if (r[loc + "PrintDesignId"]) {
				// get the standard/unnamed screens for this
				statement = db.prepare(`SELECT Screen.* FROM Screen
				INNER JOIN ScreenPrintDesign ON ScreenPrintDesign.ScreenId=Screen.ScreenId
				WHERE Name is null
				AND SizeCategory = ?
				AND PrintDesignId=?
				AND ${loc}=1
				`)
				const standardScreens = statement.all(r.SizeCategory, r[loc + "PrintDesignId"])
				
				standardScreens.forEach(screen => {
					screens[loc].push(screen)
				})

			}

			if (r[`Screen${loc}1Number`].length > 0 )
				screens[loc].push({ Number: r[`Screen${loc}1Number`], Colour: r[`Screen${loc}1Colour`], Name: r[`Screen${loc}1Name`] })
			if (r[`Screen${loc}2Number`].length > 0 )
				screens[loc].push({ Number: r[`Screen${loc}2Number`], Colour: r[`Screen${loc}2Colour`], Name: r[`Screen${loc}2Name`] })

				if (r[`TransferName${loc}1Name`].length > 0 )
				transfers[loc].push(r[`TransferName${loc}1Name`])

				if (r[`Usb${loc}1Number`].length > 0 )
				usbs[loc].push({ Number: r[`Usb${loc}1Number`], Colour: r[`Usb${loc}1Notes`] })
			if (r[`Usb${loc}2Number`].length > 0 )
				usbs[loc].push({ Number: r[`Usb${loc}2Number`], Colour: r[`Usb${loc}2Notes`] })

			

		})
	})


	return {
		screens,
		usbs,
		transfers
	}

}


module.exports = router