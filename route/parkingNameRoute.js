const express = require("express");

const parkingNameController = require("./../controller/parkingNameController");

const route = express.Router();

route.route("/").get(parkingNameController.getAllParkingName).post(parkingNameController.createParking);
// route.route("/:id").get();

module.exports = route;
