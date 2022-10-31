module.exports = class Order {

	constructor(orderObj) {

		if (orderObj) {
			this.OrderId = orderObj.OrderId,
			this.CustomerId = orderObj.CustomerId,
			this.OrderNumber = orderObj.OrderNumber,
			this.OrderDate = orderObj.OrderDate,
			this.InvoiceDate = orderObj.InvoiceDate,
			this.Repeat = orderObj.Repeat,
			this.New = orderObj.New,
			this.BuyIn = orderObj.BuyIn,
			this.Terms = orderObj.Terms,
			this.SalesRep = orderObj.SalesRep,
			this.Notes = orderObj.Notes,
			this.DeliveryDate = orderObj.DeliveryDate,
			this.CustomerOrderNumber = orderObj.CustomerOrderNumber,
			this.ProcessedDate = orderObj.ProcessedDate,
			this.Done = orderObj.Done,
			this.Deleted = orderObj.Deleted,
			this.CreatedBy = orderObj.CreatedBy,
			this.CreatedDateTime = orderObj.CreatedDateTime,
			this.LastModifiedBy = orderObj.LastModifiedBy,
			this.LastModifiedDateTime = orderObj.LastModifiedDateTime
		}
		else {
			this.OrderId = 0,
			this.CustomerId = 0,
			this.OrderNumber = "",
			this.OrderDate = new Date(),
			this.InvoiceDate = null,
			this.Repeat = null,
			this.New = false,
			this.BuyIn = false,
			this.Terms = false,
			this.SalesRep = "",
			this.Notes = "",
			this.DeliveryDate = "",
			this.CustomerOrderNumber = "",
			this.ProcessedDate = null,
			this.Done = false,
			this.Deleted = false,
			this.CreatedBy = "",
			this.CreatedDateTime = null,
			this.LastModifiedBy = "",
			this.LastModifiedDateTime = null
		}

		this.customer = {} //todo customer model, this needs to be set separately
		this.products = [] // this needs to be set separately
		this.designs = {} // this needs to be set separately, it is the design info from products[0]
	} 

	setCustomer(customer) {
		this.customer = customer
	}

	setProducts(products) {
		this.products = products
	}


}

