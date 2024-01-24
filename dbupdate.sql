 DROP VIEW "main"."SalesSearch_View";
 CREATE VIEW SalesSearch_View AS 

SELECT 
OrderId, OrderNumber, OrderDate, Region.Name AS Region, SalesTotal.SalesRep, DateProcessed, 
Delivery,  Customer.Company, Terms, BuyIn, SalesTotal.Notes, Done, CustomerId, StockOrderId, SalesTotal.RegionId, SalesTotal.CustomerId,

	(SELECT IFNULL(fpd.Code, '') || ' ' || IFNULL(fpd.Notes, '') || '| ' || IFNULL(bpd.Code, '') || ' ' || IFNULL(bpd.Notes, '') || '| ' || IFNULL(ppd.Code, '') || ' ' || IFNULL(ppd.Notes, '') || '| ' || IFNULL(spd.Code, '') || ' ' || IFNULL(spd.Notes, '')
		 || IFNULL(fed.Code, '') || ' ' || IFNULL(fed.Notes, '') || '| ' || IFNULL(bed.Code, '') || ' ' || IFNULL(bed.Notes, '') || '| ' || IFNULL(ped.Code, '') || ' ' || IFNULL(ped.Notes, '') || '| ' || IFNULL(sed.Code, '') || ' ' || IFNULL(sed.Notes, '')
		 || IFNULL(ftd.Code, '') || ' ' || IFNULL(ftd.Notes, '') || '| ' || IFNULL(btd.Code, '') || ' ' || IFNULL(btd.Notes, '') || '| ' || IFNULL(ptd.Code, '') || ' ' || IFNULL(ptd.Notes, '') || '| ' || IFNULL(std.Code, '') || ' ' || IFNULL(std.Notes, '')
		FROM Sales 
			LEFT JOIN PrintDesign      fpd ON fpd.PrintDesignId     =FrontPrintDesignId
			LEFT JOIN PrintDesign      bpd ON bpd.PrintDesignId     =BackPrintDesignId
			LEFT JOIN PrintDesign      ppd ON ppd.PrintDesignId     =PocketPrintDesignId
			LEFT JOIN PrintDesign      spd ON spd.PrintDesignId     =SleevePrintDesignId
			LEFT JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId=FrontEmbroideryDesignId
			LEFT JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId=BackEmbroideryDesignId
			LEFT JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId=PocketEmbroideryDesignId
			LEFT JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId=SleeveEmbroideryDesignId
			LEFT JOIN TransferDesign   ftd ON ftd.TransferDesignId  =FrontTransferDesignId
			LEFT JOIN TransferDesign   btd ON btd.TransferDesignId  =BackTransferDesignId
			LEFT JOIN TransferDesign   ptd ON ptd.TransferDesignId  =PocketTransferDesignId
			LEFT JOIN TransferDesign   std ON std.TransferDesignId  =SleeveTransferDesignId
			WHERE Sales.OrderId=SalesTotal.OrderId) AS DesignNames,
	(SELECT '|' || IFNULL(fpd.PrintDesignId, '') || '|' || IFNULL(bpd.PrintDesignId, '') || '|' || IFNULL(ppd.PrintDesignId, '') || '|' || IFNULL(spd.PrintDesignId, '') || '|'
		FROM Sales 
			LEFT JOIN PrintDesign fpd ON fpd.PrintDesignId = FrontPrintDesignId
			LEFT JOIN PrintDesign bpd ON bpd.PrintDesignId = BackPrintDesignId
			LEFT JOIN PrintDesign ppd ON ppd.PrintDesignId = PocketPrintDesignId
			LEFT JOIN PrintDesign spd ON spd.PrintDesignId = SleevePrintDesignId
			WHERE Sales.OrderId=SalesTotal.OrderId) AS PrintDesignIds,
	(SELECT '|' || IFNULL(fs.ScreenId,  '') || '|' || IFNULL(bs.ScreenId,  '') || '|' || IFNULL(ps.ScreenId,  '') || '|' || IFNULL(ss.ScreenId,  '') || '|' ||
			IFNULL(fs2.ScreenId, '') || '|' || IFNULL(bs2.ScreenId, '') || '|' || IFNULL(ps2.ScreenId, '') || '|' || IFNULL(ss2.ScreenId, '') || '|'
		FROM Sales 
			LEFT JOIN Screen fs ON fs.ScreenId = FrontScreenId
			LEFT JOIN Screen bs ON bs.ScreenId = BackScreenId
			LEFT JOIN Screen ps ON ps.ScreenId = PocketScreenId
			LEFT JOIN Screen ss ON ss.ScreenId = SleeveScreenId
			LEFT JOIN Screen fs2 ON fs2.ScreenId = FrontScreen2Id
			LEFT JOIN Screen bs2 ON bs2.ScreenId = BackScreen2Id
			LEFT JOIN Screen ps2 ON ps2.ScreenId = PocketScreen2Id
			LEFT JOIN Screen ss2 ON ss2.ScreenId = SleeveScreen2Id
			WHERE Sales.OrderId=SalesTotal.OrderId) AS ScreenIds,
	(SELECT '|' || IFNULL(fed.EmbroideryDesignId, '') || '|' || IFNULL(bed.EmbroideryDesignId, '') || '|' || IFNULL(ped.EmbroideryDesignId, '') || '|' || IFNULL(sed.EmbroideryDesignId, '') || '|'
		FROM Sales 
			LEFT JOIN EmbroideryDesign fed ON fed.EmbroideryDesignId = FrontEmbroideryDesignId
			LEFT JOIN EmbroideryDesign bed ON bed.EmbroideryDesignId = BackEmbroideryDesignId
			LEFT JOIN EmbroideryDesign ped ON ped.EmbroideryDesignId = PocketEmbroideryDesignId
			LEFT JOIN EmbroideryDesign sed ON sed.EmbroideryDesignId = SleeveEmbroideryDesignId
			WHERE Sales.OrderId=SalesTotal.OrderId) AS EmbroideryDesignIds,
	(SELECT '|' || IFNULL(fu.UsbId,  '') || '|' || IFNULL(bu.UsbId,  '') || '|' || IFNULL(pu.UsbId, '')  || '|' || IFNULL(su.UsbId,  '') || '|' ||
			       IFNULL(fu2.UsbId, '') || '|' || IFNULL(bu2.UsbId, '') || '|' || IFNULL(pu2.UsbId, '') || '|' || IFNULL(su2.UsbId, '') || '|'
		FROM Sales 
			LEFT JOIN Usb fu ON fu.UsbId = FrontUsbId
			LEFT JOIN Usb bu ON bu.UsbId = BackUsbId
			LEFT JOIN Usb pu ON pu.UsbId = PocketUsbId
			LEFT JOIN Usb su ON su.UsbId = SleeveUsbId
			LEFT JOIN Usb fu2 ON fu2.UsbId = FrontUsb2Id
			LEFT JOIN Usb bu2 ON bu2.UsbId = BackUsb2Id
			LEFT JOIN Usb pu2 ON pu2.UsbId = PocketUsb2Id
			LEFT JOIN Usb su2 ON su2.UsbId = SleeveUsb2Id
			WHERE Sales.OrderId=SalesTotal.OrderId) AS UsbIds,
	(SELECT '|' || IFNULL(ftd.TransferDesignId, '') || '|' || IFNULL(btd.TransferDesignId, '') || '|' || IFNULL(ptd.TransferDesignId, '') || '|' || IFNULL(std.TransferDesignId, '') || '|'
		FROM Sales 
			LEFT JOIN TransferDesign ftd ON ftd.TransferDesignId = FrontTransferDesignId
			LEFT JOIN TransferDesign btd ON btd.TransferDesignId = BackTransferDesignId
			LEFT JOIN TransferDesign ptd ON ptd.TransferDesignId = PocketTransferDesignId
			LEFT JOIN TransferDesign std ON std.TransferDesignId = SleeveTransferDesignId
			WHERE Sales.OrderId=SalesTotal.OrderId) AS TransferDesignIds,
	(SELECT '|' || IFNULL(ftn.TransferNameId,  '') || '|' || IFNULL(btn.TransferNameId,  '') || '|' || IFNULL(ptn.TransferNameId, '')  || '|' || IFNULL(stn.TransferNameId,  '') || '|' ||
			       IFNULL(ftn2.TransferNameId, '') || '|' || IFNULL(btn2.TransferNameId, '') || '|' || IFNULL(ptn2.TransferNameId, '') || '|' || IFNULL(stn2.TransferNameId, '') || '|'
		FROM Sales 
			LEFT JOIN TransferName ftn ON ftn.TransferNameId = FrontTransferNameId
			LEFT JOIN TransferName btn ON btn.TransferNameId = BackTransferNameId
			LEFT JOIN TransferName ptn ON ptn.TransferNameId = PocketTransferNameId
			LEFT JOIN TransferName stn ON stn.TransferNameId = SleeveTransferNameId
			LEFT JOIN TransferName ftn2 ON ftn2.TransferNameId = FrontTransferName2Id
			LEFT JOIN TransferName btn2 ON btn2.TransferNameId = BackTransferName2Id
			LEFT JOIN TransferName ptn2 ON ptn2.TransferNameId = PocketTransferName2Id
			LEFT JOIN TransferName stn2 ON stn2.TransferNameId = SleeveTransferName2Id
			WHERE Sales.OrderId=SalesTotal.OrderId) AS TransferNameIds
			
FROM SalesTotal
LEFT JOIN Customer USING (CustomerId)
LEFT JOIN Region USING (RegionId)



