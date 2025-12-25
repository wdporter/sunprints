
const auditColumns = ["CreatedBy", "CreatedDateTime", "LastModifiedBy", "LastModifiedDateTime"]

const nameAuditColumns = [auditColumns[0], auditColumns[2]]
const dateAuditColumns = [auditColumns[1], auditColumns[3]]

const createdColumns = auditColumns.slice(0, 2)
const lastModifiedColumns = auditColumns.slice(2)

module.exports = { auditColumns, createdColumns, lastModifiedColumns, nameAuditColumns, dateAuditColumns }