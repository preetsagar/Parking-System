const mongoose = require("mongoose");

const parkingName = mongoose.Schema({
  name: {
    type: String,
    required: [true, "It must be a name"],
    unique: true,
  },
  address: {
    type: String,
  },
});

const ParkingName = mongoose.model("ParkingName", parkingName);

module.exports = ParkingName;
