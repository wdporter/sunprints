const { auditColumns } = require("../config/auditColumns.js")


module.exports = class AuditLogDao {

	constructor(db) {
		this.db = db
	}


	/**
	 * inserts the give information into the audit log tables
	 * @param {string} table name of the table
	 * @param {string} pkey name of the primary key id of the object
	 * @param {object} obj the object whose values to insert must have properties pkey, CreatedBy, CreatedDateTime
	 */
	insert(table, pkey, obj) {

		// 1. Audit Log
		let query = /*sql*/`
INSERT INTO AuditLog 
( ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime )
VALUES (?, ?, 'INS', ?, ?) `

		let statement = this.db.prepare(query)

		let info = statement.run(table, obj[pkey], obj.CreatedBy, obj.CreatedDateTime)
		let auditLogId = info.lastInsertRowid

		// 2. Audit Log Entry
		query = /*sql*/`
INSERT INTO AuditLogEntry 
( AuditLogId, PropertyName, NewValue)
VALUES ( ${auditLogId}, ?, ? )
		`
		statement = this.db.prepare(query)

		Object.keys(obj).forEach(key => {
			if (auditColumns.includes(key))
				return // we don't insert audit columns into AuditLog Entry
			if (key == pkey)
				return // we don't insert primary key into Audit Log Entry

			statement.run(key, obj[key])
		})

	}//~ insert


	/**
	 * updates the audit log tables with the given information
	 * @param {string} table name of the table
	 * @param {string} pkey name of the primary key id of the object
	 * @param {object} old the original object
	 * @param {object} newObj the new values to save, must have properties pkey, LastModifiedBy, LastModifiedDateTime
	 */
	update(table, pkey, old, newObj) {

		// 1. Audit Log
		let query = /*sql*/`
INSERT INTO AuditLog 
( ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime )
VALUES (?, ?, 'UPD', ?, ?) `

		let statement = this.db.prepare(query)

		let info = statement.run(table, newObj[pkey], newObj.LastModifiedBy, newObj.LastModifiedDateTime)
		let auditLogId = info.lastInsertRowid

		// 2. Audit Log Entry
		query = /*sql*/`
INSERT INTO AuditLogEntry 
( AuditLogId, PropertyName, OldValue, NewValue)
VALUES ( ${auditLogId}, ?, ?, ?)
		`
		statement = this.db.prepare(query)

		Object.keys(newObj).forEach(key => {
			if (auditColumns.includes(key))
				return // we don't insert audit columns into AuditLog Entry
			if (key == pkey)
				return // we don't insert primary key into Audit Log Entry

			if (old[key] !== newObj[key])
				statement.run(key, old[key], newObj[key])
		})
	} 
	//~ update




	/**
	 * updates the audit log tables with the given information
	 * @param {string} table name of the table
	 * @param {string} pkey name of the primary key id of the object
	 * @param {object} old the original object
	 */
	delete(table, pkey, oldObj) {

		// 1. Audit Log
		let query = /*sql*/`
INSERT INTO AuditLog 
( ObjectName, Identifier, AuditAction, CreatedBy, CreatedDateTime )
VALUES (?, ?, 'DEL', ?, ?) `

		let statement = this.db.prepare(query)

		let info = statement.run(table, oldObj[pkey], oldObj.LastModifiedBy, oldObj.LastModifiedDateTime)
		let auditLogId = info.lastInsertRowid

		// 2. Audit Log Entry
		query = /*sql*/`
INSERT INTO AuditLogEntry 
( AuditLogId, PropertyName, OldValue, NewValue)
VALUES ( ${auditLogId}, ?, ?, null)
		`
		statement = this.db.prepare(query)

		Object.keys(oldObj).forEach(key => {
			if (auditColumns.includes(key))
				return // we don't insert audit columns into AuditLog Entry
			if (key == pkey)
				return // we don't insert primary key into Audit Log Entry

			statement.run(key, oldObj[key])
		})
	}
	//~ delete

}