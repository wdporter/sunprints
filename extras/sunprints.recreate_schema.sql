BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "AuditLog" (
	"AuditLogId"	INTEGER,
	"ObjectName"	TEXT NOT NULL,
	"Identifier"	INTEGER NOT NULL,
	"AuditAction"	TEXT NOT NULL,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("AuditLogId")
);
CREATE TABLE IF NOT EXISTS "AuditLogEntry" (
	"AuditLogEntryId"	INTEGER,
	"AuditLogId"	INTEGER NOT NULL,
	"PropertyName"	TEXT,
	"OldValue"	TEXT,
	"NewValue"	TEXT,
	FOREIGN KEY("AuditLogId") REFERENCES "AuditLog"("AuditLogId"),
	PRIMARY KEY("AuditLogEntryId")
);
CREATE TABLE IF NOT EXISTS "Screen" (
	"ScreenId"	INTEGER,
	"Number"	TEXT NOT NULL,
	"Colour"	TEXT,
	"Name"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("ScreenId")
);
CREATE TABLE IF NOT EXISTS "TransferName" (
	"TransferNameId"	INTEGER,
	"Name"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("TransferNameId")
);
CREATE TABLE IF NOT EXISTS "PrintDesign" (
	"PrintDesignId"	INTEGER,
	"Code"	TEXT NOT NULL,
	"Notes"	TEXT,
	"Comments"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("PrintDesignId")
);
CREATE TABLE IF NOT EXISTS "TransferDesign" (
	"TransferDesignId"	INTEGER,
	"Code"	TEXT NOT NULL,
	"Notes"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("TransferDesignId")
);
CREATE TABLE IF NOT EXISTS "ScreenPrintDesign" (
	"ScreenPrintDesignId"	INTEGER,
	"PrintDesignId"	INTEGER NOT NULL,
	"ScreenId"	INTEGER NOT NULL,
	"SizeCategory"	TEXT NOT NULL,
	"Front"	INTEGER DEFAULT 0,
	"Back"	INTEGER DEFAULT 0,
	"Pocket"	INTEGER DEFAULT 0,
	"Sleeve"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	FOREIGN KEY("ScreenId") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("PrintDesignId") REFERENCES "PrintDesign"("PrintDesignId"),
	PRIMARY KEY("ScreenPrintDesignId")
);
CREATE TABLE IF NOT EXISTS "TransferNameTransferDesign" (
	"TransferNameTransferDesignId"	INTEGER,
	"TransferDesignId"	INTEGER NOT NULL,
	"TransferNameId"	INTEGER NOT NULL,
	"SizeCategory"	TEXT NOT NULL,
	"Front"	INTEGER NOT NULL,
	"Back"	INTEGER NOT NULL,
	"Pocket"	INTEGER NOT NULL,
	"Sleeve"	INTEGER NOT NULL,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("TransferNameTransferDesignId")
);
CREATE TABLE IF NOT EXISTS "Usb" (
	"UsbId"	INTEGER,
	"Number"	TEXT NOT NULL,
	"Notes"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("UsbId")
);
CREATE TABLE IF NOT EXISTS "EmbroideryDesign" (
	"EmbroideryDesignId"	INTEGER,
	"Code"	TEXT NOT NULL,
	"Notes"	TEXT,
	"Comments"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("EmbroideryDesignId")
);
CREATE TABLE IF NOT EXISTS "UsbEmbroideryDesign" (
	"UsbEmbroideryDesignId"	INTEGER,
	"UsbId"	INTEGER NOT NULL,
	"EmbroideryDesignId"	INTEGER NOT NULL,
	"SizeCategory"	TEXT NOT NULL,
	"Front"	INTEGER DEFAULT 0,
	"Back"	INTEGER DEFAULT 0,
	"Pocket"	INTEGER DEFAULT 0,
	"Sleeve"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	FOREIGN KEY("UsbId") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("EmbroideryDesignId") REFERENCES "EmbroideryDesign"("EmbroideryDesignId"),
	PRIMARY KEY("UsbEmbroideryDesignId")
);
CREATE TABLE IF NOT EXISTS "Customer" (
	"CustomerId"	INTEGER,
	"Code"	TEXT NOT NULL UNIQUE,
	"Company"	TEXT NOT NULL,
	"Surname"	TEXT,
	"FirstName"	TEXT,
	"PhoneOffice"	TEXT,
	"PhoneHome"	TEXT,
	"PhoneMobile"	TEXT,
	"Fax"	TEXT,
	"Email"	TEXT,
	"AddressLine1"	TEXT,
	"AddressLine2"	TEXT,
	"Locality"	TEXT,
	"Postcode"	TEXT,
	"State"	TEXT,
	"Notes"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	"CustNotes"	TEXT,
	"SalesRep"	TEXT,
	"FollowUpDate"	INTEGER,
	"RegionId"	INTEGER,
	PRIMARY KEY("CustomerId")
);
CREATE TABLE IF NOT EXISTS "Supplier" (
	"SupplierId"	INTEGER,
	"Code"	TEXT NOT NULL UNIQUE,
	"Company"	TEXT NOT NULL,
	"Surname"	TEXT,
	"FirstName"	TEXT,
	"PhoneOffice"	TEXT,
	"PhoneHome"	TEXT,
	"PhoneMobile"	TEXT,
	"Fax"	TEXT,
	"Email"	TEXT,
	"AddressLine1"	TEXT,
	"AddressLine2"	TEXT,
	"Locality"	TEXT,
	"Postcode"	TEXT,
	"State"	TEXT,
	"Notes"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("SupplierId")
);
CREATE TABLE IF NOT EXISTS "Garment" (
	"GarmentId"	INTEGER,
	"Code"	TEXT NOT NULL,
	"Label"	TEXT NOT NULL,
	"Type"	TEXT NOT NULL,
	"Colour"	TEXT NOT NULL,
	"Notes"	TEXT,
	"SizeCategory"	TEXT NOT NULL,
	"K0"	INTEGER DEFAULT 0,
	"K1"	INTEGER DEFAULT 0,
	"K2"	INTEGER DEFAULT 0,
	"K4"	INTEGER DEFAULT 0,
	"K6"	INTEGER DEFAULT 0,
	"K8"	INTEGER DEFAULT 0,
	"K10"	INTEGER DEFAULT 0,
	"K12"	INTEGER DEFAULT 0,
	"K14"	INTEGER DEFAULT 0,
	"K16"	INTEGER DEFAULT 0,
	"AXS"	INTEGER DEFAULT 0,
	"ASm"	INTEGER DEFAULT 0,
	"AM"	INTEGER DEFAULT 0,
	"AL"	INTEGER DEFAULT 0,
	"AXL"	INTEGER DEFAULT 0,
	"A2XL"	INTEGER DEFAULT 0,
	"A3XL"	INTEGER DEFAULT 0,
	"A4XL"	INTEGER DEFAULT 0,
	"A5XL"	INTEGER DEFAULT 0,
	"A6XL"	INTEGER DEFAULT 0,
	"A7XL"	INTEGER DEFAULT 0,
	"A8XL"	INTEGER DEFAULT 0,
	"W6"	INTEGER DEFAULT 0,
	"W8"	INTEGER DEFAULT 0,
	"W10"	INTEGER DEFAULT 0,
	"W12"	INTEGER DEFAULT 0,
	"W14"	INTEGER DEFAULT 0,
	"W16"	INTEGER DEFAULT 0,
	"W18"	INTEGER DEFAULT 0,
	"W20"	INTEGER DEFAULT 0,
	"W22"	INTEGER DEFAULT 0,
	"W24"	INTEGER DEFAULT 0,
	"W26"	INTEGER DEFAULT 0,
	"W28"	INTEGER DEFAULT 0,
	"MinK0"	INTEGER DEFAULT 0,
	"MinK1"	INTEGER DEFAULT 0,
	"MinK2"	INTEGER DEFAULT 0,
	"MinK4"	INTEGER DEFAULT 0,
	"MinK6"	INTEGER DEFAULT 0,
	"MinK8"	INTEGER DEFAULT 0,
	"MinK10"	INTEGER DEFAULT 0,
	"MinK12"	INTEGER DEFAULT 0,
	"MinK14"	INTEGER DEFAULT 0,
	"MinK16"	INTEGER DEFAULT 0,
	"MinAXS"	INTEGER DEFAULT 0,
	"MinASm"	INTEGER DEFAULT 0,
	"MinAM"	INTEGER DEFAULT 0,
	"MinAL"	INTEGER DEFAULT 0,
	"MinAXL"	INTEGER DEFAULT 0,
	"MinA2XL"	INTEGER DEFAULT 0,
	"MinA3XL"	INTEGER DEFAULT 0,
	"MinA4XL"	INTEGER DEFAULT 0,
	"MinA5XL"	INTEGER DEFAULT 0,
	"MinA6XL"	INTEGER DEFAULT 0,
	"MinA7XL"	INTEGER DEFAULT 0,
	"MinA8XL"	INTEGER DEFAULT 0,
	"MinW6"	INTEGER DEFAULT 0,
	"MinW8"	INTEGER DEFAULT 0,
	"MinW10"	INTEGER DEFAULT 0,
	"MinW12"	INTEGER DEFAULT 0,
	"MinW14"	INTEGER DEFAULT 0,
	"MinW16"	INTEGER DEFAULT 0,
	"MinW18"	INTEGER DEFAULT 0,
	"MinW20"	INTEGER DEFAULT 0,
	"MinW22"	INTEGER DEFAULT 0,
	"MinW24"	INTEGER DEFAULT 0,
	"MinW26"	INTEGER DEFAULT 0,
	"MinW28"	INTEGER DEFAULT 0,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("GarmentId")
);
CREATE TABLE IF NOT EXISTS "Orders" (
	"OrderId"	INTEGER,
	"CustomerId"	INTEGER NOT NULL,
	"OrderNumber"	TEXT NOT NULL,
	"OrderDate"	TEXT NOT NULL,
	"InvoiceDate"	TEXT,
	"Repeat"	INTEGER DEFAULT 0,
	"New"	INTEGER DEFAULT 0,
	"BuyIn"	INTEGER DEFAULT 0,
	"Terms"	TEXT,
	"SalesRep"	TEXT,
	"Notes"	TEXT,
	"Updated"	INTEGER DEFAULT 0,
	"DeliveryDate"	TEXT,
	"CustomerOrderNumber"	TEXT,
	"Company"	TEXT,
	"Freight"	TEXT,
	"ProcessedDate"	TEXT,
	"InvoiceNumber"	TEXT,
	"Done"	INTEGER DEFAULT 0,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	"StockOrderId"	INTEGER,
	"RegionId"	INTEGER,
	FOREIGN KEY("CustomerId") REFERENCES "Customer"("CustomerId"),
	PRIMARY KEY("OrderId")
);
CREATE TABLE IF NOT EXISTS "OrderGarment" (
	"OrderGarmentId"	INTEGER,
	"OrderId"	INTEGER NOT NULL,
	"GarmentId"	INTEGER NOT NULL,
	"FrontPrintDesignId"	INTEGER,
	"FrontScreenId"	INTEGER,
	"FrontScreen2Id"	INTEGER,
	"BackPrintDesignId"	INTEGER,
	"BackScreenId"	INTEGER,
	"BackScreen2Id"	INTEGER,
	"PocketPrintDesignId"	INTEGER,
	"PocketScreenId"	INTEGER,
	"PocketScreen2Id"	INTEGER,
	"SleevePrintDesignId"	INTEGER,
	"SleeveScreenId"	INTEGER,
	"SleeveScreen2Id"	INTEGER,
	"FrontEmbroideryDesignId"	INTEGER,
	"FrontUsbId"	INTEGER,
	"FrontUsb2Id"	INTEGER,
	"BackEmbroideryDesignId"	INTEGER,
	"BackUsbId"	INTEGER,
	"BackUsb2Id"	INTEGER,
	"PocketEmbroideryDesignId"	INTEGER,
	"PocketUsbId"	INTEGER,
	"PocketUsb2Id"	INTEGER,
	"SleeveEmbroideryDesignId"	INTEGER,
	"SleeveUsbId"	INTEGER,
	"SleeveUsb2Id"	INTEGER,
	"FrontTransferDesignId"	INTEGER,
	"FrontTransferNameId"	INTEGER,
	"FrontTransferName2Id"	INTEGER,
	"BackTransferDesignId"	INTEGER,
	"BackTransferNameId"	INTEGER,
	"BackTransferName2Id"	INTEGER,
	"PocketTransferDesignId"	INTEGER,
	"PocketTransferNameId"	INTEGER,
	"PocketTransferName2Id"	INTEGER,
	"SleeveTransferDesignId"	INTEGER,
	"SleeveTransferNameId"	INTEGER,
	"SleeveTransferName2Id"	INTEGER,
	"K0"	INTEGER DEFAULT 0,
	"K1"	INTEGER DEFAULT 0,
	"K2"	INTEGER DEFAULT 0,
	"K4"	INTEGER DEFAULT 0,
	"K6"	INTEGER DEFAULT 0,
	"K8"	INTEGER DEFAULT 0,
	"K10"	INTEGER DEFAULT 0,
	"K12"	INTEGER DEFAULT 0,
	"K14"	INTEGER DEFAULT 0,
	"K16"	INTEGER DEFAULT 0,
	"W6"	INTEGER DEFAULT 0,
	"W8"	INTEGER DEFAULT 0,
	"W10"	INTEGER DEFAULT 0,
	"W12"	INTEGER DEFAULT 0,
	"W14"	INTEGER DEFAULT 0,
	"W16"	INTEGER DEFAULT 0,
	"W18"	INTEGER DEFAULT 0,
	"W20"	INTEGER DEFAULT 0,
	"W22"	INTEGER DEFAULT 0,
	"W24"	INTEGER DEFAULT 0,
	"W26"	INTEGER DEFAULT 0,
	"W28"	INTEGER DEFAULT 0,
	"AXS"	INTEGER DEFAULT 0,
	"ASm"	INTEGER DEFAULT 0,
	"AM"	INTEGER DEFAULT 0,
	"AL"	INTEGER DEFAULT 0,
	"AXL"	INTEGER DEFAULT 0,
	"A2XL"	INTEGER DEFAULT 0,
	"A3XL"	INTEGER DEFAULT 0,
	"A4XL"	INTEGER DEFAULT 0,
	"A5XL"	INTEGER DEFAULT 0,
	"A6XL"	INTEGER DEFAULT 0,
	"A7XL"	INTEGER DEFAULT 0,
	"A8XL"	INTEGER DEFAULT 0,
	"Price"	TEXT,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	FOREIGN KEY("PocketEmbroideryDesignId") REFERENCES "EmbroideryDesign"("EmbroideryDesignId"),
	FOREIGN KEY("PocketUsbId") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("SleeveEmbroideryDesignId") REFERENCES "EmbroideryDesign"("EmbroideryDesignId"),
	FOREIGN KEY("SleeveUsbId") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("SleeveUsb2Id") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("FrontTransferDesignId") REFERENCES "TransferDesign"("TransferDesignId"),
	FOREIGN KEY("FrontTransferNameId") REFERENCES "TransferName"("TransferNameId"),
	FOREIGN KEY("FrontTransferName2Id") REFERENCES "TransferName"("TransferNameId"),
	FOREIGN KEY("PocketUsb2Id") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("BackTransferDesignId") REFERENCES "TransferDesign"("TransferDesignId"),
	FOREIGN KEY("PocketTransferDesignId") REFERENCES "TransferDesign"("TransferDesignId"),
	FOREIGN KEY("BackTransferNameId") REFERENCES "TransferName"("TransferNameId"),
	FOREIGN KEY("PocketTransferNameId") REFERENCES "TransferName"("TransferNameId"),
	FOREIGN KEY("SleeveTransferDesignId") REFERENCES "TransferDesign"("TransferDesignId"),
	FOREIGN KEY("SleeveTransferNameId") REFERENCES "TransferName"("TransferNameId"),
	FOREIGN KEY("PocketTransferName2Id") REFERENCES "TransferName"("TransferNameId"),
	FOREIGN KEY("SleeveTransferName2Id") REFERENCES "TransferName"("TransferNameId"),
	FOREIGN KEY("BackTransferName2Id") REFERENCES "TransferName"("TransferNameId"),
	FOREIGN KEY("FrontScreen2Id") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("FrontPrintDesignId") REFERENCES "PrintDesign"("PrintDesignId"),
	FOREIGN KEY("BackPrintDesignId") REFERENCES "PrintDesign"("PrintDesignId"),
	FOREIGN KEY("FrontScreenId") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("BackScreen2Id") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("PocketPrintDesignId") REFERENCES "PrintDesign"("PrintDesignId"),
	FOREIGN KEY("BackScreenId") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("PocketScreenId") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("PocketScreen2Id") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("GarmentId") REFERENCES "Garment"("GarmentId"),
	FOREIGN KEY("OrderId") REFERENCES "Orders"("OrderId"),
	FOREIGN KEY("FrontEmbroideryDesignId") REFERENCES "EmbroideryDesign"("EmbroideryDesignId"),
	FOREIGN KEY("BackUsbId") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("FrontUsb2Id") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("SleevePrintDesignId") REFERENCES "PrintDesign"("PrintDesignId"),
	FOREIGN KEY("FrontUsbId") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("SleeveScreen2Id") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("BackUsb2Id") REFERENCES "Usb"("UsbId"),
	FOREIGN KEY("SleeveScreenId") REFERENCES "Screen"("ScreenId"),
	FOREIGN KEY("BackEmbroideryDesignId") REFERENCES "EmbroideryDesign"("EmbroideryDesignId"),
	PRIMARY KEY("OrderGarmentId")
);
CREATE TABLE IF NOT EXISTS "StockOrder" (
	"StockOrderId"	INTEGER,
	"SupplierId"	INTEGER NOT NULL,
	"OrderDate"	TEXT NOT NULL,
	"ReceiveDate"	TEXT,
	"Notes"	TEXT,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	FOREIGN KEY("SupplierId") REFERENCES "Supplier"("SupplierId"),
	PRIMARY KEY("StockOrderId")
);
CREATE TABLE IF NOT EXISTS "StockOrderGarment" (
	"StockOrderGarmentId"	INTEGER,
	"StockOrderId"	INTEGER NOT NULL,
	"GarmentId"	INTEGER NOT NULL,
	"K0"	INTEGER DEFAULT 0,
	"K1"	INTEGER DEFAULT 0,
	"K2"	INTEGER DEFAULT 0,
	"K4"	INTEGER DEFAULT 0,
	"K6"	INTEGER DEFAULT 0,
	"K8"	INTEGER DEFAULT 0,
	"K10"	INTEGER DEFAULT 0,
	"K12"	INTEGER DEFAULT 0,
	"K14"	INTEGER DEFAULT 0,
	"K16"	INTEGER DEFAULT 0,
	"AXS"	INTEGER DEFAULT 0,
	"ASm"	INTEGER DEFAULT 0,
	"AM"	INTEGER DEFAULT 0,
	"AL"	INTEGER DEFAULT 0,
	"AXL"	INTEGER DEFAULT 0,
	"A2XL"	INTEGER DEFAULT 0,
	"A3XL"	INTEGER DEFAULT 0,
	"A4XL"	INTEGER DEFAULT 0,
	"A5XL"	INTEGER DEFAULT 0,
	"A6XL"	INTEGER DEFAULT 0,
	"A7XL"	INTEGER DEFAULT 0,
	"A8XL"	INTEGER DEFAULT 0,
	"W6"	INTEGER DEFAULT 0,
	"W8"	INTEGER DEFAULT 0,
	"W10"	INTEGER DEFAULT 0,
	"W12"	INTEGER DEFAULT 0,
	"W14"	INTEGER DEFAULT 0,
	"W16"	INTEGER DEFAULT 0,
	"W18"	INTEGER DEFAULT 0,
	"W20"	INTEGER DEFAULT 0,
	"W22"	INTEGER DEFAULT 0,
	"W24"	INTEGER DEFAULT 0,
	"W26"	INTEGER DEFAULT 0,
	"W28"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	FOREIGN KEY("StockOrderId") REFERENCES "StockOrder"("StockOrderId"),
	FOREIGN KEY("GarmentId") REFERENCES "Garment"("GarmentId"),
	PRIMARY KEY("StockOrderGarmentId")
);
CREATE TABLE IF NOT EXISTS "User" (
	"Name"	TEXT NOT NULL UNIQUE,
	"Password"	TEXT NOT NULL,
	"Admin"	INTEGER DEFAULT 0,
	"SalesRep"	INTEGER DEFAULT 0,
	"PowerUser"	INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "SalesTotal" (
	"OrderId"	INTEGER NOT NULL UNIQUE,
	"OrderNumber"	TEXT,
	"CustomerId"	INTEGER,
	"SalesRep"	TEXT,
	"OrderDate"	TEXT,
	"Repeat"	INTEGER,
	"New"	INTEGER,
	"BuyIn"	INTEGER,
	"Terms"	TEXT,
	"Delivery"	TEXT,
	"Notes"	TEXT,
	"FrontPrintDesignId"	INTEGER,
	"FrontScreenId"	INTEGER,
	"FrontScreen2Id"	INTEGER,
	"BackPrintDesignId"	INTEGER,
	"BackScreenId"	INTEGER,
	"BackScreen2Id"	INTEGER,
	"PocketPrintDesignId"	INTEGER,
	"PocketScreenId"	INTEGER,
	"PocketScreen2Id"	INTEGER,
	"SleevePrintDesignId"	INTEGER,
	"SleeveScreenId"	INTEGER,
	"SleeveScreen2Id"	INTEGER,
	"FrontEmbroideryDesignId"	INTEGER,
	"FrontUsbId"	INTEGER,
	"FrontUsb2Id"	INTEGER,
	"BackEmbroideryDesignId"	INTEGER,
	"BackUsbId"	INTEGER,
	"BackUsb2Id"	INTEGER,
	"PocketEmbroideryDesignId"	INTEGER,
	"PocketUsbId"	INTEGER,
	"PocketUsb2Id"	INTEGER,
	"SleeveEmbroideryDesignId"	INTEGER,
	"SleeveUsbId"	INTEGER,
	"SleeveUsb2Id"	INTEGER,
	"TotalQuantity"	INTEGER,
	"TotalValue"	REAL,
	"CustomerOrderNumber"	TEXT,
	"Company"	TEXT,
	"Freight"	REAL,
	"DateProcessed"	TEXT,
	"DateInvoiced"	TEXT,
	"InvoiceNumber"	TEXT,
	"Done"	INTEGER,
	"StockOrderId"	INTEGER,
	"RegionId"	INTEGER
);
CREATE TABLE IF NOT EXISTS "Sales" (
	"OrderId"	INTEGER NOT NULL,
	"GarmentId"	INTEGER NOT NULL,
	"SizeCategory"	TEXT,
	"OrderNumber"	TEXT,
	"CustomerId"	INTEGER,
	"OrderDate"	TEXT,
	"Repeat"	INTEGER,
	"New"	INTEGER,
	"BuyIn"	INTEGER,
	"Terms"	TEXT,
	"Delivery"	TEXT,
	"Notes"	TEXT,
	"FrontPrintDesignId"	INTEGER,
	"FrontScreenId"	INTEGER,
	"FrontScreen2Id"	INTEGER,
	"BackPrintDesignId"	INTEGER,
	"BackScreenId"	INTEGER,
	"BackScreen2Id"	INTEGER,
	"PocketPrintDesignId"	INTEGER,
	"PocketScreenId"	INTEGER,
	"PocketScreen2Id"	INTEGER,
	"SleevePrintDesignId"	INTEGER,
	"SleeveScreenId"	INTEGER,
	"SleeveScreen2Id"	INTEGER,
	"FrontEmbroideryDesignId"	INTEGER,
	"FrontUsbId"	INTEGER,
	"FrontUsb2Id"	INTEGER,
	"BackEmbroideryDesignId"	INTEGER,
	"BackUsbId"	INTEGER,
	"BackUsb2Id"	INTEGER,
	"PocketEmbroideryDesignId"	INTEGER,
	"PocketUsbId"	INTEGER,
	"PocketUsb2Id"	INTEGER,
	"SleeveEmbroideryDesignId"	INTEGER,
	"SleeveUsbId"	INTEGER,
	"SleeveUsb2Id"	INTEGER,
	"FrontTransferDesignId"	INTEGER,
	"FrontTransferNameId"	INTEGER,
	"FrontTransferName2Id"	INTEGER,
	"BackTransferDesignId"	INTEGER,
	"BackTransferNameId"	INTEGER,
	"BackTransferName2Id"	INTEGER,
	"PocketTransferDesignId"	INTEGER,
	"PocketTransferNameId"	INTEGER,
	"PocketTransferName2Id"	INTEGER,
	"SleeveTransferDesignId"	INTEGER,
	"SleeveTransferNameId"	INTEGER,
	"SleeveTransferName2Id"	INTEGER,
	"K0"	INTEGER DEFAULT 0,
	"K1"	INTEGER DEFAULT 0,
	"K2"	INTEGER DEFAULT 0,
	"K4"	INTEGER DEFAULT 0,
	"K6"	INTEGER DEFAULT 0,
	"K8"	INTEGER DEFAULT 0,
	"K10"	INTEGER DEFAULT 0,
	"K12"	INTEGER DEFAULT 0,
	"K14"	INTEGER DEFAULT 0,
	"K16"	INTEGER DEFAULT 0,
	"AXS"	INTEGER DEFAULT 0,
	"ASm"	INTEGER DEFAULT 0,
	"AM"	INTEGER DEFAULT 0,
	"AL"	INTEGER DEFAULT 0,
	"AXL"	INTEGER DEFAULT 0,
	"A2XL"	INTEGER DEFAULT 0,
	"A3XL"	INTEGER DEFAULT 0,
	"A4XL"	INTEGER DEFAULT 0,
	"A5XL"	INTEGER DEFAULT 0,
	"A6XL"	INTEGER DEFAULT 0,
	"A7XL"	INTEGER DEFAULT 0,
	"A8XL"	INTEGER DEFAULT 0,
	"W6"	INTEGER DEFAULT 0,
	"W8"	INTEGER DEFAULT 0,
	"W10"	INTEGER DEFAULT 0,
	"W12"	INTEGER DEFAULT 0,
	"W14"	INTEGER DEFAULT 0,
	"W16"	INTEGER DEFAULT 0,
	"W18"	INTEGER DEFAULT 0,
	"W20"	INTEGER DEFAULT 0,
	"W22"	INTEGER DEFAULT 0,
	"W24"	INTEGER DEFAULT 0,
	"W26"	INTEGER DEFAULT 0,
	"W28"	INTEGER DEFAULT 0,
	"Price"	REAL,
	"CustomerOrderNumber"	TEXT,
	"Company"	TEXT,
	"Freight"	REAL,
	"DateProcessed"	TEXT,
	"DateInvoiced"	TEXT,
	"InvoiceNumber"	TEXT,
	"OrderGarmentId"	INTEGER DEFAULT 0
);
CREATE TABLE IF NOT EXISTS "SalesRep" (
	"SalesRepId"	INTEGER NOT NULL,
	"Name"	TEXT NOT NULL,
	"Deleted"	INTEGER NOT NULL DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("SalesRepId")
);
CREATE TABLE IF NOT EXISTS "Region" (
	"RegionId"	INTEGER,
	"Name"	TEXT NOT NULL,
	"Order"	INTEGER DEFAULT 0,
	"Deleted"	INTEGER DEFAULT 0,
	"CreatedBy"	TEXT NOT NULL,
	"CreatedDateTime"	TEXT NOT NULL,
	"LastModifiedBy"	TEXT NOT NULL,
	"LastModifiedDateTime"	TEXT NOT NULL,
	PRIMARY KEY("RegionId")
);
CREATE INDEX IF NOT EXISTS "SalesTotal_Index" ON "SalesTotal" (
	"OrderId"
);
CREATE INDEX IF NOT EXISTS "SalesTotal_OrderId_Index" ON "SalesTotal" (
	"OrderId"
);
CREATE VIEW OrderSearch_View AS 

SELECT OrderId, OrderNumber, Customer.CustomerId, Customer.Company AS CustomerName, 
		OrderDate, Repeat, New, Buyin, Done, Terms, 
		Orders.SalesRep, Orders.RegionId, Orders.Notes, DeliveryDate,
		(SELECT IFNULL(fpd.code, '') || ',' || IFNULL(bpd.code, '') || ',' || IFNULL(ppd.code, '') || ',' || IFNULL(spd.code, '')
			||  IFNULL(fed.code, '') || ',' || IFNULL(bed.code, '') || ',' || IFNULL(ped.code, '') || ',' || IFNULL(sed.code, '')	
			||  IFNULL(ftd.code, '') || ',' || IFNULL(btd.code, '') || ',' || IFNULL(ptd.code, '') || ',' || IFNULL(std.code, '')	
			FROM OrderGarment 
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
				WHERE OrderGarment.OrderId=Orders.OrderId) AS Designs,
		(SELECT IFNULL(fpd.Code, '') || ' ' || IFNULL(fpd.Notes, '') || '; ' || IFNULL(bpd.Code, '') || ' ' || IFNULL(bpd.Notes, '') || '; ' || IFNULL(ppd.Code, '') || ' ' || IFNULL(ppd.Notes, '') || '; ' || IFNULL(spd.Code, '') || ' ' || IFNULL(spd.Notes, '')
			 || IFNULL(fed.Code, '') || ' ' || IFNULL(fed.Notes, '') || '; ' || IFNULL(bed.Code, '') || ' ' || IFNULL(bed.Notes, '') || '; ' || IFNULL(ped.Code, '') || ' ' || IFNULL(ped.Notes, '') || '; ' || IFNULL(sed.Code, '') || ' ' || IFNULL(sed.Notes, '')
			 || IFNULL(ftd.Code, '') || ' ' || IFNULL(ftd.Notes, '') || '; ' || IFNULL(btd.Code, '') || ' ' || IFNULL(btd.Notes, '') || '; ' || IFNULL(ptd.Code, '') || ' ' || IFNULL(ptd.Notes, '') || '; ' || IFNULL(std.Code, '') || ' ' || IFNULL(std.Notes, '')
			FROM OrderGarment 
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
				WHERE OrderGarment.OrderId=Orders.OrderId) AS DesignsDisplay
FROM Orders
LEFT JOIN Customer USING (CustomerId)
WHERE Orders.Deleted=0  
	AND ProcessedDate IS NULL;
COMMIT;
