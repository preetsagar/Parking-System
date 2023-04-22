const express = require("express");
const userController = require("./../controller/userController");
const authController = require("./../controller/authController");

const route = express.Router();

route.route("/").get(userController.getAllUser).post(userController.createUser);
route.route("/:id").get(userController.getAUser);
route.route("/getTransactionHistory/:id").get(userController.getTransactionHistiory);
route.route("/addMoneyToWallet").post(userController.addMoneyToWallet);

route.route("/addVehicle").post(userController.addVehicle);
route.route("/removeVehicle").post(userController.removeVehicle);

route.route("/signUp").post(authController.signUp);
route.route("/login").post(authController.login);

module.exports = route;
