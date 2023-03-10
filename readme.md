This is the reference implementation of sunprints

All other projects must work, look and feel the same as this one

## To do

- [ ] on the order page, products open up in a popup when a button is clicked
- [ ] users can change a product

````sql
INSERT INTO Sales 
      (OrderId, GarmentId, FrontEmbroideryDesignId, FrontUsbId, AXS, Price, OrderGarmentId)
select OrderId, GarmentId, FrontEmbroideryDesignId, FrontUsbId, AXS, Price, OrderGarmentId 
	FROM OrderGarment 
	WHERE OrderGarmentId IN (2999, 3000);
````
