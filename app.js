const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const bodyParser = require("body-parser")

const apiRouter = require("./routes/api")
const auditLogRouter = require("./routes/auditlog")
const customerRouter = require("./routes/customer")
const embroideryRouter = require("./routes/embroidery")
const productRouter = require("./routes/garment")
const homeRouter = require("./routes/home")
const orderRouter = require("./routes/order")
const printRouter = require("./routes/print")
const purchaseOrdersRouter = require("./routes/purchaseorders")
const purchasingRouter = require("./routes/purchasing")
const regionRouter = require("./routes/region")
const repRouter = require("./routes/rep")
const salesRouter = require("./routes/sales")
const screenRouter = require("./routes/screen")
const stockOrderRouter = require("./routes/stockorder")
const supplierRouter = require("./routes/supplier")
const transferRouter = require("./routes/transfer")
const usbRouter = require("./routes/usb")
const userRouter = require("./routes/user")

const req = require("express/lib/request")
const app = express()

const getDB = require("./integration/dbFactory");

app.locals.config = require("./config/config.js");

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")

app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, "public")))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// do our basic auth
app.use (function(req, res, next) {
 
	// send the request back to authenticate
	const reject = () => {
		res.setHeader("WWW-Authenticate", `Basic realm="sprealm"`);
		res.sendStatus(401)
	}

	// have they already authenticated?
	if (!req.headers.authorization) {
		// okay, well send the request for authentication here
		return reject()
	}

	// break open the authorization object sent by the users
	const [username, password] = Buffer.from(req.headers.authorization.replace("Basic ", ""), "base64").toString().split(":")

	// go to db to get user information
	let db, user
	try {
		db = getDB()
		user = db.prepare(/*sql*/`SELECT * FROM User WHERE Name=? COLLATE NOCASE`).get(username)
	}
	finally {
		db.close()
	}

	if ( user == undefined || user == null) {
		throw new Error(`no user ${username}`)
	}

	var hash = require('crypto').createHash('md5').update(password).digest("hex")
	if (hash === user.Password) {
		req.auth = {user : username};
		res.locals.poweruser = user.PowerUser == 1
		res.locals.salesrep = user.SalesRep == 1
		res.locals.admin = user.Admin == 1
		return next()
	}
	else {
		throw new Error(`wrong password`)
	}
})


app.use("/", homeRouter)
app.use("/api", apiRouter)
app.use("/auditlog", auditLogRouter)
app.use("/customer", customerRouter)
app.use("/embroidery", embroideryRouter)
app.use("/garment", productRouter) // deprecated, use product instead
app.use("/product", productRouter)
app.use("/order", orderRouter)
app.use("/print", printRouter)
app.use("/purchaseorders", purchaseOrdersRouter)
app.use("/purchasing", purchasingRouter)
app.use("/region", regionRouter)
app.use("/rep", repRouter)
app.use("/sales", salesRouter)
app.use("/screen", screenRouter)
app.use("/stockorder", stockOrderRouter)
app.use("/supplier", supplierRouter)
app.use("/transfer", transferRouter)
app.use("/usb", usbRouter)
app.use("/user", userRouter)


// catch 404 and forward to error handler
// this works by being applied to any path that is not defined
app.use(function(req, res, next) {
  next(createError(404))
})


// error handler
// because the first argument is "err", this is called whenever the first argument to "next" is an Error
app.use(function(err, req, res, next) {
	console.error(`❌ Error in ${req.method} ${req.path}:`, err);

  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

app.use(logger("dev"))



module.exports = app

