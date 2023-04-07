const express = require("express");
const slotController = require("../controller/slotController");

const slotRoute = express.Router();

slotRoute.route("/empty").get(slotController.getAllEmptySlots);

slotRoute.route("/parkingId/:parkingId").get(slotController.getSlotByParkingId);
slotRoute.route("/parkingId/empty/:parkingId").get(slotController.getEmptySlotByParkingId);

slotRoute.route("/updateOccupancy/:id").patch(slotController.updateOccupancy);
slotRoute.route("/updateAssigned/:id").patch(slotController.updateAssigned);

slotRoute.route("/").get(slotController.getAllSlots).post(slotController.createSlot);
slotRoute.route("/:id").delete(slotController.deleteSlot).get(slotController.getASlot);

module.exports = slotRoute;
