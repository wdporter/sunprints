const { validationResult } = require('express-validator');

/** function to wrap a request/response, and guarantees all exceptions will be handled */
const handler = fn => (req, res, next) => {
	try{
  		fn(req, res, next)
	}
	catch (err) { 
		next(err) 
	}
}

/** function to wrap a request/response, and guarantees all exceptions will be handled 
 * @async
*/
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * used with express-validation
 * if the validation result has errors, it will send a 400 response and a json payload with the error details
* @param {Object} req 
 * @param {Object} res the response
 * @param {Function} next to be called next
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
	return res.status(400).json({ 
	  error: 'Validation failed',
	  details: errors.array()
	});
  }
  next();
};

/**converts the given string into an iso date string 
 * @param {String} d the date string, which must be in the LastModifiedDateTime format, for example 31/10/2024, 9:55:48 am . If the string doesn't match, behaviour is undefined
 * @return {String} a date string in the ISO format, for example 2024-10-31T09:55:48 
*/
const convertToIsoDate = (d) =>
{ 
		const parts = d.split(", ")
		const dateParts = parts[0].split("/")
		const timeStringParts = parts[1].split(" ")
		const timeParts = timeStringParts[0].split(":")
		let hour = parseInt(timeParts[0])
		if (timeStringParts[1] == "pm" && hour != 12)
			hour +=12

		if (hour > 23)
			debugger

		if (dateParts[0].length == 1)
			dateParts[0] = "0" + dateParts[0]
		if (dateParts[1].length == 1)
			dateParts[1] = "0" + dateParts[1]
		
		d = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}T${hour < 10 ? "0" : ""}${hour}:${timeParts[1]}:${timeParts[2]}`
		
		// now check this date is ok
		let parse = Date.parse(d)
		if (isNaN(parse)) {
			//if it doesn't parse, then it's probably in US format, so swap day and month around
			d = `${dateParts[2]}-${dateParts[0]}-${dateParts[1]}T${hour < 10 ? "0" : ""}${hour}:${timeParts[1]}:${timeParts[2]}`

			parse = Date.parse(d)
			if (isNaN(parse))
				console.log("could not parse date", d )
		}

		return d
}


module.exports = { handler, asyncHandler, validate, convertToIsoDate }