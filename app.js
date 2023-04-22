const express = require("express");
const morgan = require("morgan");
const slotRoute = require("./route/slotRoute");
const handleGloalError = require("./controller/globalErrorController");
const parkingNameRoute = require("./route/parkingNameRoute");
const userRoute = require("./route/userRoute");
const transactionRoute = require("./route/transactionRoute");
const Razorpay = require("razorpay");
const gateOpen = require("./gateOpen");
const gateRoute = require("./route/gateRoute");
const cors = require("cors");

const app = express();

// MIDDLEWARE
// print the request in the console
app.use(morgan("dev"));
// add the body to the req.body
app.use(express.json());
// Defining the view Engine
app.set("view engine", "ejs");
// allow from local server
app.use(cors());

var instance = new Razorpay({
  key_id: "rzp_test_Oi69HJagINaREZ",
  key_secret: "V8bz7OLp4lriREQl4xDPsSEa",
});

// app.get("/", function (req, res, next) {
//   res.json({ gateOpen });
// });

app.use("/api/v1/slots", slotRoute);
app.use("/api/v1/parkingNames", parkingNameRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/transactions", transactionRoute);
app.use("/api/v1/gate", gateRoute);
app.get("/success-page", function (req, res, next) {
  res.render("success-page");
});

// app.get("/api/v1/payment", function (req, res) {
//   res.render("payment");
// });

// Handling Global Error
app.use(handleGloalError);

module.exports = app;
