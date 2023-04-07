const Database = require("better-sqlite3");

const db = new Database("sunprints.db", {  fileMustExist: true, verbose: console.log  })

module.exports = db