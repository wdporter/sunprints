const express = require("express");
const router = express.Router();
const { json } = require("body-parser");
const sz = require("../sizes.js");
const getDB = require ("../integration/dbFactory.js"); // todo refactor so we don't need this here
const UnitOfWork = require("../service/UnitOfWork.js");

const dtColumnNames = [
	{dt: "", db: ""},
	{dt: "Order Id", db: "OrderId"},
	{dt: "Order Number", db: "OrderNumber"},
	{dt: "Order Date", db: "OrderDate"},
	{dt: "Region Rep", db: "Owner"},
	{dt: "Processed Date", db: "DateProcessed"},
	{dt: "Delivery Date", db: "Delivery"},
	{dt: "Design", db: "Designs"}, 
	{dt: "Customer", db: "Company"}, 
	{dt: "Terms", db: "Terms"},
	{dt: "Buy In", db: "Buyin"},
	{dt: "Notes", db: "Notes"},
	{dt: "Done", db: "Done"}
];

/* GET Sales History page. */
router.get("/", (req, res) => {

	const uw = new UnitOfWork();

	res.render("sales2.ejs", {
		title: "Sales History",
		user: req.auth.user,
		poweruser: res.locals.poweruser,
		sizes: sz.allSizes,
		locations: sz.locations,
		art: sz.art,
		regions: uw.getRegionService().getNames(), 
		salesreps: uw.getSalesRepService().getNames(), 
		columnNames: dtColumnNames.map(c => c.dt),
		stylesheets: [
			"/stylesheets/buttons.dataTables-2.2.3.css", 
			"/stylesheets/sales-theme.css",
			"/stylesheets/fixedHeader.dataTables.min.css"
		],
		javascripts:  [
			"/javascripts/dataTables.buttons-2.2.3.js",
			"/javascripts/dataTables.fixedHeader.min.js",
		]
	})
})


// GET datatable ajax for sales history table
router.get("/dt", (req, res) => {
	
	const uw = new UnitOfWork();

	try {
		console.log(req.query.customSearch)

		const salesHistoryService = uw.getSalesHistoryService();
		const searchResults = uw.salesHistoryService.getSearchResults(
			req.query.customSearch, 
			dtColumnNames[req.query.order[0].column].db, 
			req.query.order[0].dir,
			req.query.start, 
			req.query.length);

		searchResults.data.forEach(d => d.DT_RowData = {id: d.OrderId})

		res.send({
			data: searchResults.data,
			recordsTotal: searchResults.recordsTotal,
			recordsFiltered: searchResults.recordsFiltered,
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
		uw.close();
	}
})


router.get("/customernames", (req, res) => {

	const uw = new UnitOfWork();

	try {
		const customerService = uw.getCustomerService();

		const customers = customerService.getSalesHistoryCustomers();
		
		res.send(
			customers
		)
	}
	catch (err)
	{
		console.log(err);
	}
	finally{
		uw.close()
	}
})


router.get("/prints", (req, res) => {
	const uw = new UnitOfWork();

	try {
		const prints = uw.getPrintService().getPrintsFromSalesHistory();

		res.send(
			prints.map(p => {
				return {
					value: p.PrintDesignId,
					name: `${p.Code} | ${p.Notes}`
				}
			})
		).end();
	}
	catch(err)
	{
		console.log(err);
	}
	finally{
		uw.close()
	}
})

router.get("/screens", (req, res) => {
	const uw = new UnitOfWork();
	try {
		const screens = uw.getScreenService().getScreensFromSalesHistory();
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
		uw.close()
	}
})


router.get("/embroideries", (req, res) => {
	const uw = new UnitOfWork();
	try {
		const embroideries = uw.getEmbroideryService().getEmbroideriesFromSalesHistory();
		res.send(
			embroideries.map(e => {
				return {
					value: e.EmbroideryDesignId,
					name: `${e.Code} | ${e.Notes}`
				}
			})
		)
	}
	catch(err) {
		uw.rollback();
		console.log(err);
	}
	finally{
		uw.close()
	}
})


router.get("/usbs", (req, res) => {
	const uw = new UnitOfWork();
	try {
		const usbs = uw.getUsbService().getUsbsFromSalesHistory();
		const data = usbs.map(u => {
			return {
				value: u.UsbId,
				name: `${u.Number} ${u.Notes}`
			}
		});

		res.send(data);

	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		uw.close()
	}
})

router.get("/transfers", (req, res) => {
	const uw = new UnitOfWork();
	try {

		const transfers = uw.getTransferService().getTransfersFromSalesHistory() 
		res.send(
			transfers.map(t => {
				return {
					value: t.TransferDesignId,
					name: `${t.Code} | ${t.Notes}`
				}
			})
		)
	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		uw.close()
	}
})


router.get("/transfernames", (req, res) => {
	const uw = new UnitOfWork();
	try {
		const names = uw.getTransferNameService().getTransferNamesFromSalesHistory();
		res.send(
			names.map(n => {
				return {
					value: n.TransferNameId,
					name: n.Name ?? "(no name)"
				}
			})
		)
	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		uw.close()
	}
})


router.get("/:orderid/history", (req, res) => {

	const db = getDB();

	try {
		let query = /*sql*/`SELECT 
		 Garment.Code || ' ' || Garment.Type AS Product
		,Garment.Colour || ' ' || Garment.Label  AS Product2 
		,fpd.Code || ' ; ' || IFNULL(fpd.Notes, '') AS FrontPrintDesign
		,bpd.Code || ' ; ' || IFNULL(bpd.Notes, '') AS BackPrintDesign
		,ppd.Code || ' ; ' || IFNULL(ppd.Notes, '') AS PocketPrintDesign
		,spd.Code || ' ; ' || IFNULL(spd.Notes, '') AS SleevePrintDesign
		,fs.Number ||  ' ; ' || IFNULL(fs.Colour, '')  || ' ; ' || IFNULL(fs.Name, '') AS FrontScreen
		,fs2.Number || ' ; ' || IFNULL(fs2.Colour, '') || ' ; ' || IFNULL(fs2.Name, '') AS FrontScreen2
		,bs.Number ||  ' ; ' || IFNULL(bs.Colour, '')  || ' ; ' || IFNULL(bs.Name, '') AS BackScreen
		,bs2.Number || ' ; ' || IFNULL(bs2.Colour, '') || ' ; ' || IFNULL(bs2.Name, '') AS BackScreen2
		,ps.Number ||  ' ; ' || IFNULL(ps.Colour, '')  || ' ; ' || IFNULL(ps.Name, '') AS PocketScreen
		,ps2.Number || ' ; ' || IFNULL(ps2.Colour, '') || ' ; ' || IFNULL(ps2.Name, '') AS PocketScreen2
		,ss.Number ||  ' ; ' || IFNULL(ss.Colour, '')  || ' ; ' || IFNULL(ss.Name, '') AS SleeveScreen
		,ss2.Number || ' ; ' || IFNULL(ss2.Colour, '') || ' ; ' || IFNULL(ss2.Name, '') AS SleeveScreen2
		,fed.Code ||   ' ; ' || IFNULL(fed.Notes, '') AS FrontEmbroideryDesign
		,bed.Code ||   ' ; ' || IFNULL(bed.Notes, '') AS BackEmbroideryDesign
		,ped.Code ||   ' ; ' || IFNULL(ped.Notes, '') AS PocketEmbroideryDesign
		,sed.Code ||   ' ; ' || IFNULL(sed.Notes, '') AS SleeveEmbroideryDesign
		,fu.Number ||  ' ; ' ||  IFNULL(fu.Notes, '') AS FrontUsb
		,fu2.Number || ' ; ' || IFNULL(fu2.Notes, '') AS FrontUsb2
		,bu.Number ||  ' ; ' ||  IFNULL(bu.Notes, '') AS BackUsb
		,bu2.Number || ' ; ' || IFNULL(bu2.Notes, '') AS BackUsb2
		,pu.Number ||  ' ; ' ||  IFNULL(pu.Notes, '') AS PocketUsb
		,pu2.Number || ' ; ' || IFNULL(pu2.Notes, '') AS PocketUsb2
		,su.Number ||  ' ; ' ||  IFNULL(su.Notes, '') AS SleeveUsb
		,su2.Number || ' ; ' || IFNULL(su2.Notes, '') AS SleeveUsb2
		,ftd.Code ||   ' ; ' || IFNULL(ftd.Notes, '') AS FrontTransferDesign
		,btd.Code ||   ' ; ' || IFNULL(btd.Notes, '') AS BackTransferDesign
		,ptd.Code ||   ' ; ' || IFNULL(ptd.Notes, '') AS PocketTransferDesign
		,std.Code ||   ' ; ' || IFNULL(std.Notes, '') AS SleeveTransferDesign
		,fn.Name AS FrontTransferName
		,fn2.Name AS FrontTransferName2
		,bn.Name AS BackTransferName
		,bn2.Name AS BackTransferName2
		,pn.Name AS PocketTransferName
		,pn2.Name AS PocketTransferName2
		,sn.Name AS SleeveTransferName
		,sn2.Name AS SleeveTransferName2
		,IFNULL(CAST(Price AS NUMERIC), '') AS Price
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
			WHERE OrderId=?`;
		let sales = db.prepare(query).all(req.params.orderid);

		// remove hanging spaces and pipes
		sales.forEach(s => {
			Object.keys(s).forEach(key => {
				if (typeof s[key] === "string") {
					s[key] = s[key].replace(/[;\s]*$/, ""); // trailing
					s[key] = s[key].replace(/^[;\s]*/, ""); // leading
				}
			});
		});

		res.send(sales);

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


// GET edit page for a sales history item
router.get("/edit/:id", (req, res) => {

	const db = getDB();

	try {

		let query = /*sql*/`SELECT 
		SalesTotal.rowid, SalesTotal.OrderId, SalesTotal.OrderNumber, SalesTotal.CustomerId, SalesTotal.SalesRep, 
		SalesTotal.OrderDate, SalesTotal.Repeat, SalesTotal.New, SalesTotal.BuyIn, SalesTotal.Terms, SalesTotal.Delivery,
		SalesTotal.Notes, SalesTotal.CustomerOrderNumber, SalesTotal.DateProcessed, SalesTotal.DateInvoiced, 
		SalesTotal.RegionId, Sales.rowid AS salesrowid, Sales.GarmentId, Sales.OrderGarmentId, Sales.Price, 
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
			RegionId: orderDetails[0].RegionId,
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
		const regions = db.prepare("SELECT RegionId, Name || CASE WHEN Deleted=1 THEN ' (deleted)' ELSE '' END AS Name FROM Region ORDER BY Deleted, [Order]").all()

		res.render("sales_edit.ejs", {
			title: "Edit Sales History",
			user: req.auth.user,
			order,
			customers,
			salesReps,
			regions,
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

	const db = getDB();

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

	const db = getDB();

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

	const db = getDB();

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
	const db = getDB();
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


// GET the jobsheet page
router.get("/jobsheet/:id", function (req, res) {

	let db = getDB();

	try {

		let statement = db.prepare(/*sql*/`
SELECT Customer.* 
FROM Customer 
INNER JOIN SalesTotal USING (CustomerId)
WHERE OrderId=?`)
		const customer = statement.get(req.params.id)

		statement = db.prepare(`SELECT * 
		FROM SalesTotal 
		WHERE OrderId=?`)
		const salesTotal = statement.get(req.params.id)

		statement = db.prepare(/*sql*/`SELECT Garment.Code AS Code, Label, Type, Garment.Colour AS Colour, Sales.* 
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
	FROM Sales
	INNER JOIN Garment USING (GarmentId)
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

		WHERE OrderId=?
		`)
		garments = statement.all(req.params.id)

		garments.forEach(g => {
			g.adultsQuantity = g.AXS + g.ASm + g.AM + g.AL + g.AXL + g.A2XL + g.A3XL + g.A4XL + g.A5XL + g.A6XL + g.A7XL + g.A8XL
			g.kidsQuantity = g.K0 + g.K1 + g.K2 + g.K4 + g.K6 + g.K8 + g.K10 + g.K12 + g.K14 + g.K16
			g.womensQuantity = g.W6 + g.W8 + g.W10 + g.W12 + g.W14 + g.W16 + g.W18 + g.W20 + g.W22 + g.W24 + g.W26 + g.W28
		})

		const designResults = getDesigns(db, req.params.id)

		const screensCount = sz.locations.reduce(function (acc, curr) {
			return acc + designResults.screens[curr].length
		}, 0)
		const usbsCount = sz.locations.reduce(function (acc, curr) {
			return acc + designResults.usbs[curr].length
		}, 0)
		const transfersCount = sz.locations.reduce(function (acc, curr) {
			return acc + designResults.transfers[curr].length
		}, 0)

		let stockorder = null
		if (salesTotal.StockOrderId) {
			stockorder = db.prepare(/*sql*/`
SELECT StockOrderId, OrderDate, StockOrder.Notes, Company 
FROM StockOrder 
INNER JOIN Supplier USING (SupplierId)
WHERE StockOrderId=?`).get(salesTotal.StockOrderId)
			stockorder.OrderDate = new Date(Date.parse(stockorder.OrderDate)).toLocaleDateString()
		}

		res.render("jobsheet.ejs", {
			customer,
			order: salesTotal,
			garments,
			screens: designResults.screens,
			usbs: designResults.usbs,
			transfers: designResults.transfers,
			locations: sz.locations,
			screensCount,
			usbsCount,
			transfersCount,
			stockorder
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


// GET a total of customer sales in a date period
router.get("/filtertotal", (req, res) => {
	const uw = new UnitOfWork();
	try {
		const { customerid, fromdate, todate, regionid, salesrep } = req.query

		const total = uw.getSalesHistoryService().getFilterTotals(customerid, fromdate, todate, regionid, salesrep);

		res.send(total.toLocaleString('en-AU', {style: 'currency', currency: 'AUD'})).end();
	}
	catch(ex) {
		console.log(ex)
	}
	finally{
		uw.close()
	}
})




////////////////////////////////////////////////////////
// POST
////////////////////////////////////////////////////////

router.post("/csv/", (req, res) => {

	query = /*sql*/`SELECT SalesTotal.OrderId, SalesTotal.OrderNumber, SalesTotal.OrderDate, SalesTotal.SalesRep, SalesTotal.DateProcessed, 
	SalesTotal.Delivery, Customer.Code, Customer.Company, Customer.CustomerId, SalesTotal.Terms, SalesTotal.BuyIn, SalesTotal.Notes, SalesTotal.Done
	,SalesTotal.StockOrderId
	FROM SalesTotal 
	LEFT OUTER JOIN Customer ON Customer.CustomerId = SalesTotal.CustomerId `
	
	const salesJoin = " INNER JOIN Sales ON Sales.OrderId=SalesTotal.OrderId "
	let useSalesJoin = false

	const params = {}
	const where = []
	if (req.body.Company && req.body.Company != "0") {
		where.push(` SalesTotal.CustomerId = @Company `)
		params.Company = req.body.Company
	}
	if (req.body.Code && req.body.Code != "0") {
		where.push(` SalesTotal.CustomerId = @Code `)
		params.Code = req.body.Code
	}
	if (req.body.DateFrom) {
		where.push(`OrderDate >= @DateFrom`)
		params.DateFrom = req.body.DateFrom
	}
	if (req.body.DateTo) {
		where.push(`OrderDate <= @DateTo`)
		params.DateTo = req.body.DateTo
	}
	if (req.body.SalesRep && req.body.SalesRep != "0") {
		where.push(`SalesTotal.SalesRep = @SalesRep`)
		params.SalesRep = req.body.SalesRep.trimEnd(" (*)")
	}
	if (req.body.Region && req.body.Region != "0") {
		where.push(`SalesTotal.RegionId = @Region`)
		params.Region = req.body.Region.trimEnd(" (*)")
	}
	if (req.body.Print && req.body.Print != "0") {
			where.push(`(Sales.FrontPrintDesignId=@Print OR Sales.BackPrintDesignId=@Print OR Sales.PocketPrintDesignId=@Print OR Sales.SleevePrintDesignId=@Print)`)
			params.Print = req.body.Print
			useSalesJoin = true
	}
	if (req.body.Screen && req.body.Screen != "0") {
		where.push(`(Sales.FrontScreenId=@Screen OR Sales.FrontScreen2Id=@Screen 
							OR Sales.BackScreenId=@Screen OR Sales.BackScreen2Id=@Screen 
							OR Sales.PocketScreenId=@Screen OR Sales.PocketScreen2Id=@Screen 
							OR Sales.SleeveScreenId=@Screen OR Sales.SleeveScreen2Id=@Screen 
							)`)
		params.Screen = req.body.Screen
		useSalesJoin = true
	}
	if (req.body.Embroidery && req.body.Embroidery != "0") {
		where.push(`(Sales.FrontEmbroideryDesignId=@Embroidery OR Sales.BackEmbroideryDesignId=@Embroidery OR Sales.PocketEmbroideryDesignId=@Embroidery OR Sales.SleeveEmbroideryDesignId=@Embroidery)`)
		params.Embroidery = req.body.Embroidery
		useSalesJoin = true
	}
	if (req.body.Usb && req.body.Usb != "0") {
		where.push(`(Sales.FrontUsbId=@Usb OR Sales.FrontUsb2Id=@Usb 
							OR Sales.BackUsbId=@Usb OR Sales.BackUsb2Id=@Usb 
							OR Sales.PocketUsbId=@Usb OR Sales.PocketUsb2Id=@Usb 
							OR Sales.SleeveUsbId=@Usb OR Sales.SleeveUsb2Id=@Usb 
							)`)
		params.Usb = req.body.Usb
		useSalesJoin = true
	}
	if (req.body.Transfer && req.body.Transfer != "0") {
		where.push(`(Sales.FrontTransferDesignId =@Transfer 
							OR Sales.BackTransferDesignId  =@Transfer 
							OR Sales.PocketTransferDesignId=@Transfer 
							OR Sales.SleeveTransferDesignId=@Transfer)`)
		params.Transfer = req.body.Transfer
		useSalesJoin = true
	}
	if (req.body.TransferName && req.body.TransferName != "0") {
		where.push(`(Sales.FrontTransferNameId =@TransferName OR Sales.FrontTransferName2Id =@TransferName 
							OR Sales.BackTransferNameId  =@TransferName OR Sales.BackTransferName2Id  =@TransferName 
							OR Sales.PocketTransferNameId=@TransferName OR Sales.PocketTransferName2Id=@TransferName 
							OR Sales.SleeveTransferNameId=@TransferName OR Sales.SleeveTransferName2Id=@TransferName 
							)`)
		params.TransferName = req.body.TransferName
		useSalesJoin = true
	}
	if (req.body.OrderNumber.trim()) {
		where.push( ` OrderNumber LIKE @OrderNumber `)
		params.OrderNumber = `%${req.body.OrderNumber}%`
	}

	if (useSalesJoin)
		query += salesJoin

	if (where.length > 0) 
		query += ` WHERE ${where.join(" AND ")} `
	else
		res.end();

	const db = getDB()
	let statement = db.prepare(query)
	let results = statement.all(params)

	const lines = [Object.keys(results[0]).join(",")]
	const data = results.map(r => {
		const values = Object.keys(r).map(k => `"${r[k]}"` )
		lines.push(values.join(","))
	})
	let csv = lines.join("\n")
	csv = csv.replace(/\"null\"/g, "")

	res.header("Content-Type", "text/csv")
	//res.attachment(`sales_${req.query.datefrom}_to_${req.query.dateto}.csv`);
	res.send(csv)

	db.close()
})



/////////////////////////////////////////////////////////
// PUT
//////////////////////////////////////////////////////////


// called by a fetch, saves a salestotal/sales item
router.put("/:orderid", (req, res) => {
	const db = getDB();

	const { Products } = req.body

	const salesTotalColumns = ["OrderNumber", "CustomerId", "CustomerOrderNumber", "SalesRep",	
	"OrderDate", "Repeat", "New", "BuyIn", "Terms", "Delivery", "Notes", "DateProcessed", "DateInvoiced", "RegionId"]

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
				if (original) {
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
				}
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



function getDesigns(db, orderid) {

	let statement = db.prepare(/*sql*/`SELECT  
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
	FROM Sales
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
	INNER JOIN Garment ON Garment.GarmentId=Sales.GarmentId
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
				statement = db.prepare(/*sql*/`SELECT Screen.* FROM Screen
INNER JOIN ScreenPrintDesign ON ScreenPrintDesign.ScreenId=Screen.ScreenId
WHERE Name IS NULL
AND PrintDesignId=?
AND ${loc}=1`)

				const standardScreens = statement.all(r[loc + "PrintDesignId"])

				standardScreens.forEach(screen => {
					screens[loc].push(screen)
				})

			}

			if (r[`Screen${loc}1Number`].length > 0)
				screens[loc].push({ Number: r[`Screen${loc}1Number`], Colour: r[`Screen${loc}1Colour`], Name: r[`Screen${loc}1Name`] })
			if (r[`Screen${loc}2Number`].length > 0)
				screens[loc].push({ Number: r[`Screen${loc}2Number`], Colour: r[`Screen${loc}2Colour`], Name: r[`Screen${loc}2Name`] })

			if (r[`TransferName${loc}1Name`].length > 0)
				transfers[loc].push(r[`TransferName${loc}1Name`])
			if (r[`TransferName${loc}2Name`].length > 0)
				transfers[loc].push(r[`TransferName${loc}2Name`])

			if (r[`Usb${loc}1Number`].length > 0)
				usbs[loc].push({ Number: r[`Usb${loc}1Number`], Notes: r[`Usb${loc}1Notes`] })
			if (r[`Usb${loc}2Number`].length > 0)
				usbs[loc].push({ Number: r[`Usb${loc}2Number`], Notes: r[`Usb${loc}2Notes`] })



		})
	})


	return {
		screens,
		usbs,
		transfers
	}

}


module.exports = router
