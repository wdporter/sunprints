update PrintDesign set code = trim(code, "	");

DROP VIEW IF EXISTS PrintDesignSearch_View;
CREATE VIEW PrintDesignSearch_View AS

SELECT PrintDesign.PrintDesignId, Code, Notes, Comments, Deleted, sales_prints.maxdate AS LastUsedDate
FROM PrintDesign
LEFT JOIN
(
    SELECT PrintDesignId, MAX(maxdate) AS maxdate FROM
    (
        SELECT Sales.FrontPrintDesignId AS PrintDesignId, MAX(SalesTotal.OrderDate, 0) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.FrontPrintDesignId
        UNION  
        SELECT Sales.BackPrintDesignId as PrintDesignId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.BackPrintDesignId
        UNION  
        SELECT Sales.PocketPrintDesignId as PrintDesignId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.PocketPrintDesignId
        UNION  
        SELECT Sales.SleevePrintDesignId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.SleevePrintDesignId
        ORDER BY PrintDesignId desc
    )
    WHERE NOT PrintDesignId IS NULL
    GROUP BY PrintDesignId
) sales_prints
ON  PrintDesign.PrintDesignId=sales_prints.PrintDesignId
WHERE Deleted=0;