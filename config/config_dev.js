// rename this file to config.js in whatever environment it is deployed

module.exports =  {

	port: 3000,
	connectionString: "sunprints_dev.db",
	dbOptions: {
		fileMustExist: true,
		verbose: console.log
	},
	platform: "dev"
}