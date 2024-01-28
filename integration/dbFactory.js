const Database = require("better-sqlite3");
const config = require("../config/config.js")

module.exports = function getDB() {

	const db = new Database(config.connectionString, config.dbOptions);

	return db;

}



