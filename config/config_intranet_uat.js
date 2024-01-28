// rename this file to config.js in whatever environment it is deployed

module.exports =  {

	port: 3002,
	connectionString: "sunprints.db",
	dbOptions: {
		fileMustExist: true,
		verbose: console.log
	},
	platform: "uat"
}