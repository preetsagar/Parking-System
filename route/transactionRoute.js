const express = require("express");
const transactionController = require("./../controller/transactionController");

const route = express.Router();

route.route("/getPayment/:vehicleNo").get(transactionController.getPayment);
route.route("/getCurrentSlot/:userId").get(transactionController.getCurrentSlot);

route.route("/").get(transactionController.getAllTransaction).post(transactionController.createATransaction);

route.route("/:vehicleNo").delete(transactionController.deleteTransaction);

module.exports = route;
