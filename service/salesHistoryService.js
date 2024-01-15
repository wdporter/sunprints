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

		const result = this.dao.getSearchResults(searchObject, sortBy, sortDirection, start, length);


		// fix the design items from a semi-colon separated string into an array of non-empty string
		result.data.forEach(d => {
			d.designItems = d.Designs?.split(";").map(x => x.trim()).filter(x => x !== "") ?? [];
			delete d.Designs;
		})

		return result
	}
}

