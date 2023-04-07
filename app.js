const express = require("express");
const morgan = require("morgan");
const slotRoute = require("./route/slotRoute");
const handleGloalError = require("./controller/globalErrorController");
const parkingNameRoute = require("./route/parkingNameRoute");
const userRoute = require("./route/userRoute");
const transactionRoute = require("./route/transactionRoute");

const app = express();

// MIDDLEWARE
// print the request in the console
app.use(morgan("dev"));
// add the body to the req.body
app.use(express.json());

app.use("/api/v1/slots", slotRoute);
app.use("/api/v1/parkingNames", parkingNameRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/transactions", transactionRoute);

// Handling Global Error
app.use(handleGloalError);

module.exports = app;
