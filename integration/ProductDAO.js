
const { allSizes } = require("../config/sizes.js")

module.exports = class ProductDao {

	constructor(db) {
		this.db = db
	}


/**
 * Returns an array of the products attached to this order
 * @param {Number} orderId the id of the order 
 * @returns {Array} products attached to the order
 */
	getByOrderId(orderId) {

		const query = /*sql*/`SELECT OrderGarmentId, OrderGarment.GarmentId, 
		${allSizes.map(sz => `OrderGarment.${sz}`).join()},
		Garment.Code, Garment.Label, Garment.Type, Garment.Colour, Garment.SizeCategory, Garment.Notes AS GarmentNotes, 
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
		FROM OrderGarment 
		INNER JOIN Garment USING (GarmentId)
		LEFT JOIN PrintDesign fpd ON fpd.PrintDesignId=OrderGarment.FrontPrintDesignId
		LEFT JOIN PrintDesign bpd ON bpd.PrintDesignId=OrderGarment.BackPrintDesignId
		LEFT JOIN PrintDesign ppd ON ppd.PrintDesignId=OrderGarment.PocketPrintDesignId
		LEFT JOIN PrintDesign spd ON spd.PrintDesignId=OrderGarment.SleevePrintDesignId
		LEFT JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId=OrderGarment.FrontEmbroideryDesignId
		LEFT JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId=OrderGarment.BackEmbroideryDesignId
		LEFT JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=OrderGarment.PocketEmbroideryDesignId
		LEFT JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=OrderGarment.SleeveEmbroideryDesignId
		LEFT JOIN TransferDesign ftd ON ftd.TransferDesignId=OrderGarment.FrontTransferDesignId
		LEFT JOIN TransferDesign btd ON btd.TransferDesignId=OrderGarment.BackTransferDesignId
		LEFT JOIN TransferDesign ptd ON ptd.TransferDesignId=OrderGarment.PocketTransferDesignId
		LEFT JOIN TransferDesign std ON std.TransferDesignId=OrderGarment.SleeveTransferDesignId
		LEFT JOIN Screen fs1 ON fs1.ScreenId=OrderGarment.FrontScreenId
		LEFT JOIN Screen fs2 ON fs2.ScreenId=OrderGarment.FrontScreen2Id
		LEFT JOIN Screen bs1 ON bs1.ScreenId=OrderGarment.BackScreenId
		LEFT JOIN Screen bs2 ON bs2.ScreenId=OrderGarment.BackScreen2Id
		LEFT JOIN Screen ps1 ON ps1.ScreenId=OrderGarment.PocketScreenId
		LEFT JOIN Screen ps2 ON ps2.ScreenId=OrderGarment.PocketScreen2Id
		LEFT JOIN Screen ss1 ON ss1.ScreenId=OrderGarment.SleeveScreenId
		LEFT JOIN Screen ss2 ON ss2.ScreenId=OrderGarment.SleeveScreen2Id
		LEFT JOIN Usb fu1 ON fu1.UsbId=OrderGarment.FrontUsbId
		LEFT JOIN Usb fu2 ON fu2.UsbId=OrderGarment.FrontUsb2Id
		LEFT JOIN Usb bu1 ON bu1.UsbId=OrderGarment.BackUsbId
		LEFT JOIN Usb bu2 ON bu2.UsbId=OrderGarment.BackUsb2Id
		LEFT JOIN Usb pu1 ON pu1.UsbId=OrderGarment.PocketUsbId
		LEFT JOIN Usb pu2 ON pu2.UsbId=OrderGarment.PocketUsb2Id
		LEFT JOIN Usb su1 ON su1.UsbId=OrderGarment.SleeveUsbId
		LEFT JOIN Usb su2 ON su2.UsbId=OrderGarment.SleeveUsb2Id
		LEFT JOIN TransferName ftn1 ON ftn1.TransferNameId=OrderGarment.FrontTransferName2Id
		LEFT JOIN TransferName ftn2 ON ftn2.TransferNameId=OrderGarment.FrontTransferName2Id
		LEFT JOIN TransferName btn1 ON btn1.TransferNameId=OrderGarment.BackTransferNameId
		LEFT JOIN TransferName btn2 ON btn2.TransferNameId=OrderGarment.BackTransferName2Id
		LEFT JOIN TransferName ptn1 ON ptn1.TransferNameId=OrderGarment.PocketTransferNameId
		LEFT JOIN TransferName ptn2 ON ptn2.TransferNameId=OrderGarment.PocketTransferName2Id
		LEFT JOIN TransferName stn1 ON stn1.TransferNameId=OrderGarment.SleeveTransferNameId
		LEFT JOIN TransferName stn2 ON stn2.TransferNameId=OrderGarment.SleeveTransferName2Id
		WHERE OrderId=?`

			const retVal = this.db.prepare(query).all(orderId)
			return retVal
	}


	/**
	 * Returns an array of the products matching the search terms
	 * @param {Number} orderId the id of the order 
	 * @returns {Array} products attached to the order
	 */
	search(terms) {

		Object.keys(terms).forEach(t => terms[t] = `%${terms[t]}%`)

		const query = /*sql*/`SELECT GarmentId, Code, Label, Type, Colour, Notes, SizeCategory, 
		${allSizes.map(s => `0 AS ${s}`).join(", ")}
		FROM Garment
		WHERE Deleted=0
		AND ${Object.keys(terms).map(t => `${t} LIKE @${t}`).join(" AND ")} `

		return this.db.prepare(query).all(terms)
	}




}