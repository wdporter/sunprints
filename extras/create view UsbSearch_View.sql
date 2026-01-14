DROP VIEW IF EXISTS UsbSearch_View;
CREATE VIEW UsbSearch_View AS

SELECT Usb.UsbId, Number, Notes, Deleted, sales_Usbs.maxdate AS LastUsedDate
FROM Usb
LEFT JOIN
(
    SELECT UsbId, MAX(maxdate) AS maxdate FROM
    (
        SELECT Sales.FrontUsbId AS UsbId, MAX(SalesTotal.OrderDate, 0) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.FrontUsbId
        UNION  
        SELECT Sales.FrontUsb2Id as UsbId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.FrontUsb2Id
        UNION  
        SELECT Sales.BackUsbId as UsbId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.BackUsbId
        UNION  
        SELECT Sales.BackUsb2Id as UsbId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.BackUsb2Id
        UNION  
        SELECT Sales.PocketUsbId as UsbId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.PocketUsbId
        UNION  
        SELECT Sales.PocketUsb2Id as UsbId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.PocketUsb2Id
        UNION  
        SELECT Sales.SleeveUsbId as UsbId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.SleeveUsbId
        UNION  
        SELECT Sales.SleeveUsb2Id as UsbId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.SleeveUsb2Id
        ORDER BY Usbid desc
    )
    WHERE NOT UsbId IS NULL
    GROUP BY UsbId
) sales_Usbs
ON  Usb.UsbId=sales_Usbs.UsbId
WHERE Deleted=0