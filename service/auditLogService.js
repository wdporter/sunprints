const AuditLogDao = require("../integration/AuditLogDAO.js")


/**
 * calls the audit log dao insert function
 * @param {Database} db a database connection, because it's probably part of a transaction
 * @param {string} table the name of the table
 * @param {string} pkey name of the primary key id
 * @param {object} obj the object whose fields will be inserted
 * @returns default
 */
function insert (db, table, pkey, obj) {

	const dao = new AuditLogDao(db)

	dao.insert(table, pkey, obj)

}

/**
 * calls the audit log dao update function
 * @param {Database} db a database connection, because it's probably part of a transaction
 * @param {string} table the name of the table
 * @param {string} pkey name of the primary key id
 * @param {object} oldObj the original values
 * @param {object} newObj the new values
 * @returns default
 */
function update(db, table, pkey, oldObj, newObj) {
	const dao = new AuditLogDao(db)
	dao.update(table, pkey, oldObj, newObj)
}

module.exports = { insert, update }