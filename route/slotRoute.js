const express = require("express");
const slotController = require("../controller/slotController");

const slotRoute = express.Router();

slotRoute.route("/updateAllSlots").post(slotController.updateAllSlots);
slotRoute.route("/empty").get(slotController.getAllEmptySlots);

slotRoute.route("/parkingId/:parkingId").get(slotController.getSlotByParkingId);
slotRoute.route("/parkingId/empty/:parkingId").get(slotController.getEmptySlotByParkingId);

slotRoute.route("/updateOccupancy").patch(slotController.updateOccupancy);
slotRoute.route("/updateAssigned").patch(slotController.updateAssigned);

slotRoute.route("/").get(slotController.getAllSlots).post(slotController.createSlot);
slotRoute.route("/:id").delete(slotController.deleteSlot).get(slotController.getASlot);

module.exports = slotRoute;
