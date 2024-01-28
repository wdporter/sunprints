const SalesHistoryDao = require("../integration/SalesHistoryDAO.js");

module.exports = class SalesHistoryService {

	constructor(db) {
		this.dao = new SalesHistoryDao(db);
	}


/**
 * gets items satisfying the given search object
 * @param {Object} searchObject an object where keys are fields to be searched on
 * @param {String} sortBy the name of the column to sort by
 * @param {String} sortDirection the direction of the sort, expected values are "asc" or "desc"
 * @param {Number} start the index of the first record to retrieve, used top determine what page we are on
 * @param {Number} length number of results to return, corresponds to the page size
 * 
 * @return {Object} data: the list of sales items, totalRecords: how many records in the database, recordsFiltered: how many records are in the filtered recordset
 */
	getSearchResults(searchObject, sortBy, sortDirection, start, length) {

		// todo, should have pulled apart the search object in the route method, only he is supposed to know about frontend, he should have made an instance of a model class to pass through
		const result = this.dao.getSearchResults(searchObject, sortBy, sortDirection, start, length);


		// fix the design items from a semi-colon separated string into an array of non-empty string
		result.data.forEach(d => {
			d.DesignNames = d.DesignNames?.split("|").map(x => x.trim()).filter(x => x !== "") ?? [];
		})

		return result
	}

	/**
 * gets items satisfying the given search object in csv form
 * @param {Object} searchObject an object where keys are fields to be searched on
 * @param {String} sortBy the name of the column to sort by
 * @param {String} sortDirection the direction of the sort, expected values are "asc" or "desc"
 * 
 * @return {Object} data: the list of sales items, totalRecords: how many records in the database, recordsFiltered: how many records are in the filtered recordset
 */
	getCsv (searchObject) {
		// todo, should have pulled apart the search object in the route method, only he is supposed to know about frontend, he should have made an instance of a model class to pass through

		// searchObject fields can be null, but db layer wants empty strings
		for (let key in searchObject) {
			if (searchObject[key] === null) {
				searchObject[key] = "";
			}
		}

		const result = this.dao.getSearchResults(searchObject, "OrderDate", "ASC", 0, -1);

		// fix the design items from a semi-colon separated string into an array of non-empty string
		result.data.forEach(d => {
			d.designItems = d.Designs?.split(";").map(x => x.trim()).filter(x => x !== "") ?? [];
			delete d.Designs;
		})

		return result


	}

	getFilterTotals(customerid, fromdate, todate, regionid, salesrep) {

		const result = this.dao.getFilterTotals(customerid, fromdate, todate, regionid, salesrep);

		var total = result.reduce((acc, curr) => acc + curr.Total, 0);

		return total;
	
	}

	/**
	 * insert a new order into the SalesTotal tabel for sales history 
	 * 
	 * @param {*} order 
	 */ 
	saveOrder(order) {
		this.dao.insert(order);
	}

	/**
	 * insert a new product line into the Sales table for sales history
	 * 
	 * @param {*} product 
	 */
	saveProduct(product) 
	{
		this.dao.insertOrderProduct(product);
	}

	/**
	 * update an order in the SalesTotal table for Sales History
	 * 
	 * @param {*} order 
	 */ 
	updateOrder(order) {
		this.dao.update(order);
	}

	/**
	 * update a product line in the Sales table for Sales History
	 * 
	 * @param {*} product 
	 */
	updateOrderProduct(product) {
		this.dao.updateOrderProduct(product);
	}

	/**
	 * delete a product line from the Sales table for sales history
	 * @param {*} product 
	 */
	deleteOrderProduct(product){
		this.dao.deleteOrderProduct(product);
	}
}

