
const auditColumns = ["CreatedBy", "CreatedDateTime", "LastModifiedBy", "LastModifiedDateTime"]

const dateColumns = [auditColumns[1], auditColumns[3]]

const createdColumns = auditColumns.slice(0, 2)
const lastModifiedColumns = auditColumns.slice(2)

// parses a date formatted by our local tolocalestring method
// applicable to CreatedBy and CreatedDateTime

function parseDate(d) {
	const parts = d.split(", ")
	const dateParts = parts[0].split("/")
	const time = parts[1].slice(0, parts[1].length-3).padStart(8, "0")
	return Date.parse(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${time}`)
}


module.exports = { auditColumns, dateColumns, parseDate, createdColumns, lastModifiedColumns }