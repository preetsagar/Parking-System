const Slot = require("../model/slotModel");
const Transaction = require("../model/transactionModel");
const User = require("../model/userModel");
const UserTransaction = require("../model/userTransactionHistoryModel");
const slotRoute = require("../route/slotRoute");

const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");

exports.getAllTransaction = catchAsync(async (ref, res, next) => {
  const transactions = await Transaction.find();
  res.status(200).json({
    status: "Success",
    result: transactions.length,
    data: {
      data: transactions,
    },
  });
});

exports.createATransaction = catchAsync(async (req, res, next) => {
  let slot;
  let slotDetails;
  if (req.body.slot) {
    // slot is given in body
    slot = await Slot.findById(req.body.slot);
    if (!slot) {
      return next(new AppError("Please enter correct Slot ID", 400));
    } else if (slot.isOccupied) {
      return next(new AppError("Slot is already Occupied", 400));
    } else {
      slot = req.body.slot;
    }
  } else {
    // check weather the vehicle is alraedy parked or not
    const data = await Transaction.findOne({ vehicleNo: req.body.vehicleNo, isComplete: false });
    if (data) {
      return next(new AppError("This vehicle is already parked", 400));
    }

    // slot is not given in body so assign a slot
    slot = await Slot.find({ isOccupied: false, isAssigned: false });
    if (!slot) {
      return next(new AppError("No slots are available", 400));
    } else {
      slotDetails = slot[0];
      slot = slot[0]._id;
    }
  }
  // UPDATE slot as occupied
  slot = await Slot.findByIdAndUpdate(slot, { isOccupied: true }, { new: true, runValidators: true });

  //   find if the vehicle is registered or not
  // if user is a registered user then update the user field in the transaction
  const user = await User.find({ vehicleNo: req.body.vehicleNo });
  // console.log(user);
  let body;
  if (user.length) {
    body = {
      slot: slot,
      vehicleNo: req.body.vehicleNo,
      user: user[0]._id,
      inTime: new Date().toISOString(),
    };
  } else {
    body = {
      slot: slot,
      vehicleNo: req.body.vehicleNo,
      inTime: new Date().toISOString(),
    };
  }
  let transaction = {};
  transaction = await Transaction.create(body);
  console.log(transaction);

  res.status(200).json({
    status: "Success",
    message: !user.length ? "Not Registered" : "Registered",
    data: {
      data: { ...transaction._doc, floor: slotDetails.floor, slotNumber: slotDetails.slotNumber },
    },
  });
});

exports.deleteTransaction = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.find({
    vehicleNo: req.params.vehicleNo,
  });

  if (!transaction.length) {
    return next(new AppError("this Vehicle is not parked, Please Check Vehicle no", 400));
  }

  // find the slot which is involved in this transaction and update occupancy as false
  const slot = await Slot.findByIdAndUpdate(
    transaction[0].slot,
    { isOccupied: false },
    { new: true, runValidators: true }
  );

  // Update the transaction as complete;
  await Transaction.findByIdAndUpdate(transaction[0]._id, { isComplete: true });
  res.status(204).json({
    status: "Success",
    data: {
      data: slot,
    },
  });
});

exports.getPayment = catchAsync(async (req, res, next) => {
  const transaction = await Transaction.find({
    vehicleNo: req.params.vehicleNo,
    isComplete: false,
  });

  // transaction not found
  if (!transaction.length) {
    return next(new AppError("Please Enter Correct Vehicle No", 400));
  }

  let inTime = new Date(transaction[0].inTime).getTime();
  let outTime = new Date().getTime();
  let stayTime = (outTime - inTime) / (1000 * 60 * 60); // In HOURS
  console.log(stayTime);
  // PAYMENT 5rs per Hours
  const Amount = Number(stayTime * 5).toFixed(2);

  // Update Current Transaction
  await Transaction.findByIdAndUpdate(transaction[0]._id, {
    outTime: new Date().toISOString(),
    isComplete: true,
  });
  // Update the current slot as unoccupied
  const slot = await Slot.findByIdAndUpdate(
    transaction[0].slot,
    { isOccupied: false },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: "Success",
    data: {
      vehicleNo: req.params.vehicleNo,
      data: {
        Amount,
        Currency: "Indian Rupee",
      },
    },
  });
});

exports.getCurrentSlot = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ _id: req.params.userId });
  let transaction = user.vehicleNo.map(async (no) => {
    return await Transaction.findOne({
      vehicleNo: no,
      isComplete: false,
    });
  });

  transaction = (await Promise.all(transaction))
    .filter((ele) => ele !== null)
    .map(async (ele) => {
      const slot = await Slot.findOne({ _id: ele.slot });
      return slot;
    });
  const slot = await Promise.all(transaction);

  res.status(200).json({
    status: "Success",
    data: slot,
  });
});
