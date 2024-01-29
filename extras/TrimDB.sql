PRAGMA foreign_keys = 0;

DELETE FROM AuditLog;
DELETE FROM AuditLogEntry;

DELETE FROM Orders WHERE OrderDate < '2022-08-18';

DELETE FROM SalesTotal WHERE OrderDate < '2022-08-18';
DELETE FROM Sales WHERE OrderId NOT IN (SELECT OrderId FROM SalesTotal);

DELETE FROM Customer WHERE Customerid NOT IN (SELECT CustomerId FROM SalesTotal);

DELETE FROM StockOrder WHERE OrderDate <  '2022-08-18';
DELETE FROM StockOrderGarment WHERE StockOrderId NOT IN (SELECT StockOrderId FROM StockOrder);

DELETE FROM OrderGarment WHERE OrderId NOT IN (SELECT OrderId FROM SalesTotal);

DELETE FROM Garment WHERE GarmentId NOT IN (SELECT GarmentId FROM Sales) AND GarmentId NOT IN (SELECT GarmentId FROM StockOrderGarment);

DELETE FROM Supplier WHERE SupplierId NOT IN (SELECT SupplierId FROM StockOrder);

DELETE FROM PrintDesign 
WHERE PrintDesignId NOT IN (SELECT DISTINCT FrontPrintDesignId  FROM Sales WHERE NOT FrontPrintDesignId  IS NULL)
AND   PrintDesignId NOT IN (SELECT DISTINCT BackPrintDesignId   FROM Sales WHERE NOT BackPrintDesignId   IS NULL)
AND   PrintDesignId NOT IN (SELECT DISTINCT SleevePrintDesignId FROM Sales WHERE NOT SleevePrintDesignId IS NULL)
AND   PrintDesignId NOT IN (SELECT DISTINCT PocketPrintDesignId FROM Sales WHERE NOT PocketPrintDesignId IS NULL);

DELETE FROM Screen
WHERE ScreenId NOT IN (SELECT DISTINCT FrontScreenId   FROM Sales WHERE NOT FrontScreenId   IS NULL)
AND   ScreenId NOT IN (SELECT DISTINCT FrontScreen2Id  FROM Sales WHERE NOT FrontScreen2Id  IS NULL)
AND   ScreenId NOT IN (SELECT DISTINCT BackScreenId    FROM Sales WHERE NOT BackScreenId    IS NULL)
AND   ScreenId NOT IN (SELECT DISTINCT BackScreen2Id   FROM Sales WHERE NOT BackScreen2Id   IS NULL)
AND   ScreenId NOT IN (SELECT DISTINCT PocketScreenId  FROM Sales WHERE NOT PocketScreenId  IS NULL)
AND   ScreenId NOT IN (SELECT DISTINCT PocketScreen2Id FROM Sales WHERE NOT PocketScreen2Id IS NULL)
AND   ScreenId NOT IN (SELECT DISTINCT SleeveScreenId  FROM Sales WHERE NOT SleeveScreenId  IS NULL)
AND   ScreenId NOT IN (SELECT DISTINCT SleeveScreen2Id FROM Sales WHERE NOT SleeveScreen2Id IS NULL);

DELETE FROM ScreenPrintDesign
WHERE PrintDesignId NOT IN (SELECT PrintDesignId FROM PrintDesign)
AND   ScreenId      NOT IN (SELECT ScreenId      FROM Screen);

DELETE FROM EmbroideryDesign 
WHERE EmbroideryDesignId NOT IN (SELECT DISTINCT FrontEmbroideryDesignId  FROM Sales WHERE NOT FrontEmbroideryDesignId  IS NULL)
AND   EmbroideryDesignId NOT IN (SELECT DISTINCT BackEmbroideryDesignId   FROM Sales WHERE NOT BackEmbroideryDesignId   IS NULL)
AND   EmbroideryDesignId NOT IN (SELECT DISTINCT SleeveEmbroideryDesignId FROM Sales WHERE NOT SleeveEmbroideryDesignId IS NULL)
AND   EmbroideryDesignId NOT IN (SELECT DISTINCT PocketEmbroideryDesignId FROM Sales WHERE NOT PocketEmbroideryDesignId IS NULL);

DELETE FROM Usb
WHERE UsbId NOT IN (SELECT DISTINCT FrontUsbId   FROM Sales WHERE NOT FrontUsbId   IS NULL)
AND   UsbId NOT IN (SELECT DISTINCT FrontUsb2Id  FROM Sales WHERE NOT FrontUsb2Id  IS NULL)
AND   UsbId NOT IN (SELECT DISTINCT BackUsbId    FROM Sales WHERE NOT BackUsbId    IS NULL)
AND   UsbId NOT IN (SELECT DISTINCT BackUsb2Id   FROM Sales WHERE NOT BackUsb2Id   IS NULL)
AND   UsbId NOT IN (SELECT DISTINCT PocketUsbId  FROM Sales WHERE NOT PocketUsbId  IS NULL)
AND   UsbId NOT IN (SELECT DISTINCT PocketUsb2Id FROM Sales WHERE NOT PocketUsb2Id IS NULL)
AND   UsbId NOT IN (SELECT DISTINCT SleeveUsbId  FROM Sales WHERE NOT SleeveUsbId  IS NULL)
AND   UsbId NOT IN (SELECT DISTINCT SleeveUsb2Id FROM Sales WHERE NOT SleeveUsb2Id IS NULL);

DELETE FROM UsbEmbroideryDesign
WHERE EmbroideryDesignId NOT IN (SELECT EmbroideryDesignId FROM EmbroideryDesign)
AND   UsbId              NOT IN (SELECT UsbId              FROM Usb);

DELETE FROM TransferDesign 
WHERE TransferDesignId NOT IN (SELECT DISTINCT FrontTransferDesignId  FROM Sales WHERE NOT FrontTransferDesignId  IS NULL)
AND   TransferDesignId NOT IN (SELECT DISTINCT BackTransferDesignId   FROM Sales WHERE NOT BackTransferDesignId   IS NULL)
AND   TransferDesignId NOT IN (SELECT DISTINCT SleeveTransferDesignId FROM Sales WHERE NOT SleeveTransferDesignId IS NULL)
AND   TransferDesignId NOT IN (SELECT DISTINCT PocketTransferDesignId FROM Sales WHERE NOT PocketTransferDesignId IS NULL);


DELETE FROM TransferName
WHERE TransferNameId NOT IN (SELECT DISTINCT FrontTransferNameId   FROM Sales WHERE NOT FrontTransferNameId   IS NULL)
AND   TransferNameId NOT IN (SELECT DISTINCT FrontTransferName2Id  FROM Sales WHERE NOT FrontTransferName2Id  IS NULL)
AND   TransferNameId NOT IN (SELECT DISTINCT BackTransferNameId    FROM Sales WHERE NOT BackTransferNameId    IS NULL)
AND   TransferNameId NOT IN (SELECT DISTINCT BackTransferName2Id   FROM Sales WHERE NOT BackTransferName2Id   IS NULL)
AND   TransferNameId NOT IN (SELECT DISTINCT PocketTransferNameId  FROM Sales WHERE NOT PocketTransferNameId  IS NULL)
AND   TransferNameId NOT IN (SELECT DISTINCT PocketTransferName2Id FROM Sales WHERE NOT PocketTransferName2Id IS NULL)
AND   TransferNameId NOT IN (SELECT DISTINCT SleeveTransferNameId  FROM Sales WHERE NOT SleeveTransferNameId  IS NULL)
AND   TransferNameId NOT IN (SELECT DISTINCT SleeveTransferName2Id FROM Sales WHERE NOT SleeveTransferName2Id IS NULL);

DELETE FROM TransferNameTransferDesign
WHERE TransferDesignId NOT IN (SELECT TransferDesignId FROM TransferDesign)
AND   TransferNameId   NOT IN (SELECT TransferNameId   FROM Usb);


VACUUM;


PRAGMA foreign_keys = 1;