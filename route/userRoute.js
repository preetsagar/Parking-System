const express = require("express");
const userController = require("./../controller/userController");

const route = express.Router();

route.route("/getTransactionHistory/:id").get(userController.getTransactionHistiory);

route.route("/").get(userController.getAllUser).post(userController.createUser);

route.route("/:id").get(userController.getAUser);

module.exports = route;
