CREATE VIEW SalesSearch_View AS 

SELECT OrderId, OrderNumber, OrderDate, IFNULL(Region.Name, '') || ':' || IFNULL(SalesTotal.SalesRep, '') AS Owner, DateProcessed, 
Delivery, 
	(SELECT IFNULL(fpd.Code, '') || ' ' || IFNULL(fpd.Notes, '') || '; ' || IFNULL(bpd.Code, '') || ' ' || IFNULL(bpd.Notes, '') || '; ' || IFNULL(ppd.Code, '') || ' ' || IFNULL(ppd.Notes, '') || '; ' || IFNULL(spd.Code, '') || ' ' || IFNULL(spd.Notes, '')
		 || IFNULL(fed.Code, '') || ' ' || IFNULL(fed.Notes, '') || '; ' || IFNULL(bed.Code, '') || ' ' || IFNULL(bed.Notes, '') || '; ' || IFNULL(ped.Code, '') || ' ' || IFNULL(ped.Notes, '') || '; ' || IFNULL(sed.Code, '') || ' ' || IFNULL(sed.Notes, '')
		 || IFNULL(ftd.Code, '') || ' ' || IFNULL(ftd.Notes, '') || '; ' || IFNULL(btd.Code, '') || ' ' || IFNULL(btd.Notes, '') || '; ' || IFNULL(ptd.Code, '') || ' ' || IFNULL(ptd.Notes, '') || '; ' || IFNULL(std.Code, '') || ' ' || IFNULL(std.Notes, '')
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
			WHERE Sales.OrderId=SalesTotal.OrderId) AS Designs,
Customer.Company, Terms, Buyin, SalesTotal.Notes, Done, CustomerId, StockOrderId, SalesTotal.RegionId, SalesTotal.SalesRep
FROM SalesTotal
LEFT JOIN Customer USING (CustomerId)
LEFT JOIN Region USING (RegionId)
