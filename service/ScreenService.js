const ScreenDao = require("../integration/ScreenDAO.js");
const { body } = require("express-validator")

/**
 * service methods to fetch screen information
 */
class ScreenService {

	constructor(db) {
		this.dao = new ScreenDao(db);
	}
	
	getScreensFromSalesHistory() {
		return this.dao.getScreensFromSalesHistory();
	}

	getAll() {
		return this.dao.all().map(s => {return { 
			id: s.ScreenId, 
			name: `${s.Number} ${s.Colour} ${s.Name}` 
		}});
	}

	/** validation rules for a screen */
	static screenValidation = [
		body("Number").trim().customSanitizer(value => value == "" ? null : value),
		body("Name").trim().customSanitizer(value => value == "" ? null : value),
		body("Colour").trim().customSanitizer(value => value == "" ? null : value)
	]

	create(screen, userName) {
		screen.LastModifiedBy = screen.CreatedBy = userName
		screen.LastModifiedDateTime = screen.CreatedDateTime= new Date().toLocaleString("en-AU")

		if (this.dao.isScreenExisting(screen)) {
			throw new Error("Validation failed", {
				cause: { 
					path: "name/number/colour",
					msg: "we already have this screen"
				}
			}) 
		}

		this.dao.createScreen(screen)
	}

	update(screen, userName) {
		screen.LastModifiedBy = userName
		screen.LastModifiedDateTime = new Date().toLocaleString("en-AU")
		if (this.dao.isScreenExisting(screen)) {
			throw new Error("Validation failed", {
				cause: { 
					path: "name/number/colour",
					msg: "we already have this screen"
				}
			}) 
		}
		this.dao.updateScreen(screen)
	}

	delete(screenId, userName) {
		this.dao.deleteScreen(screenId, userName)
	}

}

module.exports = ScreenService;