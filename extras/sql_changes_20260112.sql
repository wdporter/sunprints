--what's changed in ScreenSearch_View:
--union all is changed to union
--the frontscreen2 query had an incorrect "group by"
--order of tables in the last join clause
--added another layer of select to remove duplicates and nulls

DROP VIEW IF EXISTS ScreenSearch_View;


CREATE VIEW ScreenSearch_View AS

SELECT Screen.ScreenId, Name, Number, Colour, Deleted, sales_screens.maxdate AS LastUsed
FROM Screen
LEFT JOIN
(
    SELECT ScreenId, MAX(maxdate) AS maxdate FROM
    (
        SELECT Sales.FrontScreenId AS ScreenId, MAX(SalesTotal.OrderDate, 0) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.FrontScreenId
        UNION  
        SELECT Sales.FrontScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.FrontScreen2Id
        UNION  
        SELECT Sales.BackScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.BackScreenId
        UNION  
        SELECT Sales.BackScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.BackScreen2Id
        UNION  
        SELECT Sales.PocketScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.PocketScreenId
        UNION  
        SELECT Sales.PocketScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.PocketScreen2Id
        UNION  
        SELECT Sales.SleeveScreenId as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.SleeveScreenId
        UNION  
        SELECT Sales.SleeveScreen2Id as ScreenId, MAX(SalesTotal.OrderDate) AS maxdate
        FROM Sales
        INNER JOIN SalesTotal ON SalesTotal.OrderId=Sales.OrderId  
        GROUP BY Sales.SleeveScreen2Id
        ORDER BY screenid desc
    )
    WHERE NOT ScreenId IS NULL
    GROUP BY ScreenId
) sales_screens
ON  Screen.ScreenId=sales_screens.ScreenId
WHERE Deleted=0;