const getDB = require("../integration/dbFactory")
const PrintDao = require("../integration/PrintDAO.js")
const EmbroideryDao = require("../integration/EmbroideryDAO.js")
const TransferDao = require("../integration/TransferDAO.js")

/**
 * Returns an array of decorations (print, embroidery, transfer). Matches when the term appears anywhere within Company or Code, case insensitive
 *
 * @param {string} location the term to search with Company or Code fields
 * @param {string} decoration the term to search with Company or Code fields
 * @param {object} terms the term to search with Company or Code fields
 * @returns {array} matching customers
 */
function search(location, decoration, terms) {

	try {
		let db = getDB()
		let dao = null
		
		switch(decoration) {
			case "Print": 
				if (!terms.code && !terms.notes && !terms.comments)
					return []
				dao = new PrintDao(db)
				break
			case "Embroidery":
				if (!terms.code && !terms.notes && !terms.comments)
					return []
				dao = new EmbroideryDao(db)
				break
			case "Transfer": 
				if (!terms.code && !terms.notes)
					return []
				dao = new TransferDao(db)
		}

		const recordset = dao.searchDesign(location, terms)

		return recordset

	}
	finally {
		db.close()
	}

}


module.exports = { search }