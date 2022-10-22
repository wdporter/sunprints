const Database = require("better-sqlite3");

module.exports = function getDB() {

	const db = new Database("sunprints.db", {  fileMustExist: true /* , verbose: console.log */ })

	return db

}

