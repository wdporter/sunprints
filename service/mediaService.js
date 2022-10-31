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
 * @returns {array} matching media
 */
 function search(media, location, designId) {
	console.log(media, location, designId)
	let db = getDB()
	try {
		
		let dao = null
		
		switch(media) {
			case "Screen": 
				dao = new PrintDao(db)
				break
			case "Usb":
				dao = new EmbroideryDao(db)
				break
			case "TransferName": 
				dao = new TransferDao(db)
		}

		const recordset = dao.getMedia(location, designId)

		return recordset

	}
	catch (err) {
		console.log(err)
		throw err
	}
	finally {
		db.close()
	}

}


module.exports = { search }
