const createError = require("http-errors")
const express = require("express")
const path = require("path")
const cookieParser = require("cookie-parser")
const logger = require("morgan")
const bodyParser = require("body-parser")
const basicAuth = require('express-basic-auth')

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


app.use(basicAuth({
	authorizer: myAuthorizer,
	challenge: true,
	realm: 'sprealm',
}));
function myAuthorizer(username, password) {
	const db = getDB();
	const user = db.prepare("SELECT * FROM User WHERE Name=? COLLATE NOCASE").get(username);
	db.close()
	if (typeof user === "undefined") {
		const message = `We could not find the user name: ${username}`;
		console.log(message);
		res.status(403).render("error", { message });
	}
	var hash = require('crypto').createHash('md5').update(password).digest("hex");
	return hash === user.Password;
}

app.use((req, res, next) => {
	const db = getDB();
	const user = db.prepare("SELECT * FROM User WHERE Name=? COLLATE NOCASE").get(req.auth.user);
	db.close();
	if (typeof user === "undefined") {
		const message = `We could not find the user name: ${username}`;
		console.log(message);
		res.status(403).render("error", { message });
	}
	res.locals.poweruser = user.PowerUser == 1
	res.locals.salesrep = user.SalesRep == 1
	res.locals.admin = user.Admin == 1

	next()
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
app.use(function(req, res, next) {
  next(createError(404))
})

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

app.use(logger("dev"))



module.exports = app

