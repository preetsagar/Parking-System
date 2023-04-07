const mongoose = require("mongoose");
const Slot = require("./slotModel");
const User = require("./userModel");

const transactionSchema = new mongoose.Schema({
  slot: {
    type: mongoose.Schema.ObjectId,
    ref: Slot,
    required: [true, "A transaction must have A SlotId"],
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
  },
  vehicleNo: {
    type: String,
    required: [true, "A transaction must have A vehicleNo"],
  },
  inTime: {
    type: String,
    default: new Date().toISOString(),
  },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
