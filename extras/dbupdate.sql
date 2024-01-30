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



-----------------------------------
-- fix audit log table
-- 30 Jan 2024
-- these were all for stockordergarment DEL
-- see if there are any more
-- unfortunately we can't guess the true date
update AuditLog
set createdDateTime = '1970-01-01 00:00:00'
where auditlogid in 
(277
,276
,82
,5058
,5057
,5056
,5055
,884
,5054
,504
,3665
,164
,2214
,4631
,4632
,1980
,4067
,1981
,1982
,2074
,2620
,3893
,3778
,3886
,4785
,7657
,7687
,7070
,7071
,7686
,8279
,14503
,12008
,12009
,11610
,11396
,11411
,13017
,13373
,13388
,15056
,15286
,14412
,16490
,17925
,18588
,18589
,17457
,18590
,18591
,18724
,18725
,19446
,19447
,19449
,19450
,22186
,22189
,21817
,43058
,21630
,22066
,21636
,21637
,21638
,21840
,21842
,21841
,21843
,23009
,23010
,22983
,22984
,22985
,22986
,22987
,22093
,22094
,22187
,22190
,22781
,22782
,23585
,24168
,24406
,24409
,24816
,24817
,25161
,25162
,24976
,25670
,25090
,25091
,25092
,25093
,25094
,25095
,25881
,26360
,26361
,26402
,26401
,28928
,28414
,29561
,30227
,31266
,31267
,31525
,32914
,33079
,33080
,33489
,33986
,33490
,35613
,35614
,34903
,35827
,34703
,35828
,35675
,34708
,34804
,36232
,36122
,36508
,37690
,38492
,39480
,50411
,42188
,42204
,43023
,43130
,46174
,46175
,46179
,46180
,46181
,46176
,46177
,46178
,44768
,44707
,45509
,47374
,47879
,51912
,51913
,53360
,52763
,52764
,52765
,55297
,58115
,58114
,55200
,55008
,55678
,55721
,57549
,58980
,58512
,58513
,58809
,59633
,59634
,64021
,63973
,63974
,62885
,62840
,62666
,62816
,62818
,62817
,63899
,62613
,64053
,71547
,64340
,65130
,65131
,65125
,65126
,65169
,65168
,65804
,65805
,65931
,65936
,67704
,66335
,66336
,68810
,68811
,67221
,68527
,67527
,69490
,68586
,68585
,68584
,70924
,70913
,74204
,73997
,75322
,74215
,98337
,74599
,74600
,76584
,75418
,75419
,75375
,77095
,77096
,77167
,77168
,79157
,79490
,79491
,79632
,80686
,80927
,80928
,89506
,85137
,87386
,87363
,87367
,87368
,87678
,87972
,87973
,88337
,89047
,89087
,89787
,97270
,90451
,90450
,95411
,92688
,92689
,92690
,94796
,92691
,97633
,97634
,91808
,91809
,91998
,92426
,94556
,94555
,95562
,96264
,96400
,97337
,97120
,97557
,96602
,97015
,97019
,97197
,97198
,97806
,97850
,97271
,97338
,100863
,99444
,99443
,102303
,103076
,102876
,102136
,102137
,102918
,102919
,116078
,116079
,116080
,116081
,102866
,115617
,108628
,108634
,111352
,109379
,109378
,111144
,110628
,112119
,111700
,112046
,112493
,113176
,112866
,114866
,113916
,113947
,114107
,114108
,115639
,122714
,117615
,117680
,117686
,123984
,120778
,120779
,122057
,121538
,122902
,125981
,123800
,124321
,124322
,127058
,125462
,125463)




