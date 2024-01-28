const express = require("express")
const router = express.Router()
const getDB = require("../integration/dbFactory");
const sz = require("../sizes.js")


/* GET Purchasing page. */
router.get("/", function (req, res) {

	let stockOrders = []
	let suppliers = []
	let orderNumber = ""
	let stockOrderId = req.query.stockorderid || ""

	const db = getDB();
	try {


		if (req.query.orderid) {
			statement = db.prepare(`SELECT OrderNumber FROM Orders WHERE OrderId=?`)
			orderNumber = statement.get(req.query.orderid).OrderNumber
		}


		statement = db.prepare(`SELECT StockOrderId, Supplier.Company AS Company, OrderDate, StockOrder.Notes 
			FROM StockOrder 
			INNER JOIN Supplier ON Supplier.SupplierId = StockOrder.SupplierId 
			WHERE StockOrder.Deleted = 0 AND StockOrder.ReceiveDate IS NULL`)
		stockOrders = statement.all()

		statement = db.prepare(`SELECT SupplierId, Company, Notes FROM Supplier WHERE Deleted=0 ORDER BY Company`)
		suppliers = statement.all()

		let garment = null
		if (req.query.garmentid) {
			garment = db.prepare("SELECT * FROM Garment WHERE GarmentId=?").get(req.query.garmentid)
			for (size of sz.allSizes) {
				garment[size] = 0
			}
			delete garment.Deleted
			delete garment.CreatedBy
			delete garment.CreatedDateTime
			delete garment.LastModifiedBy
			delete garment.LastModifiedDateTime
			Object.keys(garment).forEach(key => {
				if (key.startsWith("Min"))
					delete garment[key]
			})
		}

		res.render("purchasing.ejs", {
			title: "Purchasing",
			stylesheets: ["/stylesheets/fixedHeader.dataTables.min.css", "/stylesheets/purchasing-theme.css"],
			user: req.auth.user,
			stockOrders,
			suppliers,
			orderNumber,
			stockOrderId,
			sizes: JSON.stringify(sz.sizes),
			supplierId: req.query?.supplier ?? "",
			garment: JSON.stringify(garment || ""),
			poweruser: res.locals.poweruser
		})



	}
	catch (err) {
		console.log("error", err)
	}
	finally {
		if (db != null)
			db.close()
	}

})


router.get("/purchaseorder/:id", function (req, res) {

	const db = getDB();
	try {


		let statement = db.prepare(`SELECT StockOrder.StockOrderId, OrderDate, StockOrder.Notes AS StockOrderNotes, 
		FirstName || ' ' || Surname AS Name, Company, AddressLine1, AddressLine2, PhoneHome, PhoneMobile, PhoneOffice, Fax, Email,Locality, Postcode, State 
	FROM StockOrder
	INNER JOIN Supplier ON StockOrder.SupplierId = Supplier.SupplierId
	WHERE StockOrderId=?`)

		const supplier = statement.get(req.params.id)

		statement = db.prepare(`SELECT
		Type, Colour, Label, SizeCategory, Garment.Notes AS Notes, 
		${sz.allSizes.map(s => `StockOrderGarment.${s}`).join(", ")} 
		FROM StockOrder 
		INNER JOIN StockOrderGarment ON StockOrderGarment.StockOrderId = StockOrder.StockOrderId 
		INNER JOIN Garment ON Garment.GarmentId = StockOrderGarment.GarmentId 
		WHERE StockOrder.StockOrderId=? 
		`)

		const results = statement.all(req.params.id)

		const garments = {
			Adults: [],
			Womens: [],
			Kids: []
		}

		results.forEach(r => {
			garments[r.SizeCategory].push(r)
		}

		)


		res.render("purchaseorder.ejs", {
			title: "Purchase Order",
			supplier,
			garments,
			sizes: sz.sizes
		})


	}
	catch (err) {
		res.statusMessage = err.message
		res.sendStatus(400)
		console.log(err)
	}
	finally {
		db.close()
	}


})

router.get("/outstanding", (req, res) => {

	const purchaseOrderService = require("../service/purchaseOrderService.js")

	res.json(purchaseOrderService.getOutstanding()).end()
})



module.exports = router