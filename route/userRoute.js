const express = require("express");
const userController = require("./../controller/userController");
const authController = require("./../controller/authController");

const route = express.Router();

route.route("/").get(userController.getAllUser).post(userController.createUser);

route.route("/getTransactionHistory/:id").get(userController.getTransactionHistiory);

route.route("/:id").get(userController.getAUser);

route.route("/signUp").post(authController.signUp);
// route.route("/login");

module.exports = route;
