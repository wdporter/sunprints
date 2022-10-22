module.exports = class Order {

	constructor(orderObj) {

		if (orderObj) {
			this.orderId = orderObj.OrderId,
			this.customerId = orderObj.CustomerId,
			this.orderNumber = orderObj.OrderNumber,
			this.orderDate = orderObj.OrderDate,
			this.invoiceDate = orderObj.InvoiceDate,
			this.repeat = orderObj.Repeat,
			this.new = orderObj.New,
			this.buyIn = orderObj.BuyIn,
			this.terms = orderObj.Terms,
			this.salesRep = orderObj.SalesRep,
			this.notes = orderObj.Notes,
			this.deliveryDate = orderObj.DeliveryDate,
			this.customerOrderNumber = orderObj.CustomerOrderNumber,
			this.processedDate = orderObj.ProcessedDate,
			this.done = orderObj.Done,
			this.deleted = orderObj.Deleted,
			this.createdBy = orderObj.CreatedBy,
			this.createdDateTime = orderObj.CreatedDateTime,
			this.lastModifiedBy = orderObj.LastModifiedBy,
			this.lastModifiedDateTim = orderObj.LastModifiedDateTime
		}
		else {
			this.orderId = 0,
			this.customerId = 0,
			this.orderNumber = "",
			this.orderDate = new Date(),
			this.invoiceDate = null,
			this.repeat = null,
			this.new = false,
			this.buyIn = false,
			this.terms = false,
			this.salesRep = "",
			this.notes = "",
			this.deliveryDate = "",
			this.customerOrderNumber = "",
			this.processedDate = null,
			this.done = false,
			this.Deleted = false,
			this.createdBy = "",
			this.CreatedDateTime = new Date(),
			this.lastModifiedBy = "",
			this.lastModifiedDateTim = new Date()
		}

		this.customer = {} //todo customer model, this needs to be set separately
		this.products = [] // this needs to be set separately
	} 

	setCustomer(customer) {
		this.customer = customer
	}

	setProducts(products) {
		this.products = products
	}


}

