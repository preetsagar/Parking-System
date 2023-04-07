const mongoose = require("mongoose");
const User = require("./userModel");

const userTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: User,
    required: [true, "A Transaction Must Have A User Id"],
  },
  vehicleNo: {
    type: String,
    // required: [true, "A transaction must have A vehicleNo"],
  },
  Date: {
    type: String,
  },
  amount: {
    type: Number,
  },
});

const UserTransaction = mongoose.model("UserTransaction", userTransactionSchema);

module.exports = UserTransaction;
