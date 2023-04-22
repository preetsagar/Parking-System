const mongoose = require("mongoose");

const gateOpen = mongoose.Schema({
  Open: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    unique: true,
    default: "12345",
  },
});

const Gate = mongoose.model("GateOpen", gateOpen);

module.exports = Gate;
