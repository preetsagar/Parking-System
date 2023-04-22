const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "A user must have a name"],
  },
  email: {
    type: String,
    required: [true, "A user must have a email"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  vehicleNo: [String],
  Balance: {
    type: Number,
    default: 0,
  },
  Passsword: {
    type: String,
    required: [true, "A user must have a password"],
  },
  mobileNo: {
    type: Number,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
