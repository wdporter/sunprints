const ScreenDao = require("../integration/ScreenDAO.js");
const { body } = require("express-validator")

/**
 * service methods to fetch screen information
 */
class ScreenService {

	/** requires a db connection
	 * @param {Object} db an open db connection
	 */
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

	/**
	 * adds audit column info, checks screen doesn't already exist, and passes to db layer 
	 * @param {Object} screen the screen object to be created
	 * @param {String} userName the name to record as CreatedBy
	 */
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

	/**
	 * updates audit column info, checks screen doesn't already exist, and passes to db layer 
	 * @param {*} screen the screen to be updated
	 * @param {*} userName the name to be recorded as LastModifiedBy
	 */
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

	/**
	 * passes parameters to data layer for deletion
	 * @param {Number} screenId the id of the screen to be deleted
	 * @param {String} userName the user name to be recorded as LastModifiedBy
	 */
	delete(screenId, userName) {
		this.dao.deleteScreen(screenId, userName)
	}

}

module.exports = ScreenService;