const Database = require("better-sqlite3");

module.exports = function getDB() {

	const db = new Database("sunprints.db", {  
		// todo, read these from configuration, including the connection string
		fileMustExist: true, 
		verbose: console.log  
	});

	db.pragma('journal_mode = WAL');

	return db;

}



