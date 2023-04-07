const mongoose = require("mongoose");
const parkingNameModel = require("./parkingNameModel");

const slotSchema = new mongoose.Schema({
  parkingId: {
    type: mongoose.Schema.ObjectId,
    ref: parkingNameModel,
  },
  floor: {
    type: Number,
    required: [true, "A slot must have a Floor Number"],
  },
  slotNumber: {
    type: Number,
    required: [true, "A slot must have a Slot Number"],
  },
  isOccupied: {
    type: Boolean,
    default: false,
    // required: [true, "A slot must be either occupied or empty"],
  },
  isAssigned: {
    type: Boolean,
    default: false,
    // required: [true, "A slot must be either assigned or empty"],
  },
  location: {
    type: {
      type: String,
      default: "Point",
      enum: ["Point"],
    },
    coordinates: [Number],
  },
});
slotSchema.index({ parkingName: 1, floor: 1, slotNumber: 1 }, { unique: true });

const Slot = mongoose.model("Slot", slotSchema);
module.exports = Slot;
