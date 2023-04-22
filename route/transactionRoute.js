const express = require("express");
const transactionController = require("./../controller/transactionController");

const route = express.Router();

route.route("/createRazorPayOrder").post(transactionController.createRazorPayOrder);
route.route("/getPayment/:vehicleNo").get(transactionController.getPayment);
route.route("/getCurrentSlot/:userId").get(transactionController.getCurrentSlot);
route.route("/updateTransactionAndSlotAsUnoccupied").post(transactionController.updateTransactionAndSlotAsUnoccupied);

route.route("/").get(transactionController.getAllTransaction).post(transactionController.createATransaction);

route.route("/:vehicleNo").delete(transactionController.deleteTransaction);

module.exports = route;
