
const auditColumns = ["CreatedBy", "CreatedDateTime", "LastModifiedBy", "LastModifiedDateTime"]

const dateColumns = ["CreatedDateTime", "LastModifiedDateTime"]


// parses a date formatted by our local tolocalestring method
// applicable to CreatedBy and CreatedDateTime
// should have stored these as timestamps lol
function parseDate(d) {

const parts = d.split(", ")

const dateParts = parts[0].split("/")

const time = parts[1].slice(0, parts[1].length-3).padStart(8, "0")


return Date.parse(`${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${time}`)


}


module.exports = { auditColumns, dateColumns, parseDate}