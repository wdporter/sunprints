const getDB = require("../integration/dbFactory")
const PrintDao = require("../integration/PrintDAO.js")
const EmbroideryDao = require("../integration/EmbroideryDAO.js")
const TransferDao = require("../integration/TransferDAO.js")


/**
 * Returns an array of media (screen, usb, transfername). Matches when the term appears anywhere within:
 * name: screen, transfer
 * number: screen, usb
 * colour: screen
 * notes:  usb
 * -- case insensitive
 * @param {string} media filters out for, one of screen/usb/transfername
 * @param {string} location filters out for, one of front/back/pocket/sleeve
 * @param {number} designId the design for which we are finding matching media
 * @param {object} terms the terms to search, properties are name, number, colour, notes
 * @returns {array} matching media
 */
 function search(media, location, designId, terms) {

	try {
		let db = getDB()
		let dao = null
		
		switch(media) {
			case "Screen": 
				if (!terms.name && !terms.colour && !terms. notes) // don't search if all fields are empty
					return []
				dao = new PrintDao(db)
				break
			case "Usb":
				if (!terms.number && !terms.notes)
					return []
				dao = new EmbroideryDao(db)
				break
			case "TransferName": 
				if (!terms.name)
					return []
				dao = new TransferDao(db)
		}

		const recordset = dao.searchMedia(location, designId, terms)

		return recordset

	}
	finally {
		db.close()
	}

}


module.exports = { search }
