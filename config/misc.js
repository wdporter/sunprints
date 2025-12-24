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


module.exports = { handler, asyncHandler, validate }