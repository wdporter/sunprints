const getDB = require("../integration/dbFactory")
const ProductDao = require("../integration/ProductDAO")

function search (terms) {

	const { code, label, type, colour } = terms
	
	if (code == "" && label == "" && type == "" && colour == "")
		return []

	if (code == "")
		delete terms.code
	if (label == "")
		delete terms.label
	if (type == "")
		delete terms.type
	if (colour == "")
		delete terms.colour

	const db = getDB()

	try {
		const productDao = new ProductDao(db)

		const LIMIT = 50
		let data = productDao.search(terms)
		return({
			totalRecords: data.length,
			data: data.slice(0, LIMIT),
			limit: LIMIT
		})



		 
	}
	finally {
		db.close()
	}


}

module.exports = { search }
