const Database = require("better-sqlite3");

module.exports = new Database("sunprints.db", {  fileMustExist: true, verbose: console.log  })

