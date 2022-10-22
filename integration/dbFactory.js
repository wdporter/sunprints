const Database = require("better-sqlite3");

module.exports = function getDB() {

	const db = new Database("sunprints.db", { /*verbose: console.log,*/ fileMustExist: true })

	return db

}

