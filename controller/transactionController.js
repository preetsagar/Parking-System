const Slot = require("../model/slotModel");
const Transaction = require("../model/transactionModel");
const User = require("../model/userModel");
const UserTransaction = require("../model/userTransactionHistoryModel");

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
  let slot = await Slot.findById(req.body.slot);

  //   find correct slot
  if (!slot) {
    return next(new AppError("Please enter correct Slot ID", 400));
  } else if (slot.isOccupied) {
    return next(new AppError("Slot is already Occupied", 400));
  } else {
    // UPDATE slot as occupied
    slot = await Slot.findByIdAndUpdate(req.body.slot, { isOccupied: true }, { new: true, runValidators: true });
  }

  const transaction = await Transaction.create({
    slot: req.body.slot,
    vehicleNo: req.body.vehicleNo,
  });

  //   find if the vehicle is registered or not
  const user = await User.find({ vehicleNo: req.body.vehicleNo });
  res.status(200).json({
    status: "Success",
    message: !user.length ? "Not Registered" : "Registered",
    data: {
      data: transaction,
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

  const slot = await Slot.findByIdAndUpdate(
    transaction[0].slot,
    { isOccupied: false },
    { new: true, runValidators: true }
  );

  await Transaction.findByIdAndDelete(transaction[0]._id);
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
  });

  if (!transaction.length) {
    return next(new AppError("Please Enter Correct Vehicle No", 400));
  }

  let inTime = new Date(transaction[0].inTime).getTime();
  let outTime = new Date().getTime();
  let stayTime = (outTime - inTime) / (1000 * 60 * 60); // In HOURS
  const Amount = Number(stayTime * 5).toFixed(2);
  // console.log(stayTime, "hours");
  // PAYMENT 5rs per Hours

  // Delete Current Transaction and Update Slot
  // await Transaction.findByIdAndDelete(transaction[0]._id);
  // const slot = await Slot.findByIdAndUpdate(
  //   transaction[0].slot,
  //   { isOccupied: false },
  //   { new: true, runValidators: true }
  // );

  // Add current Transaction to user transaction is User IS REGISTERED
  const user = await User.find({ vehicleNo: transaction[0].vehicleNo });
  // console.log(user, transaction[0].vehicleNo);
  if (user.length) {
    await UserTransaction.create({
      user: user[0]._id,
      vehicleNo: transaction[0].vehicleNo,
      amount: Amount,
      Date: new Date().toISOString(),
    });
  }

  res.status(200).json({
    status: "Success",
    data: {
      data: {
        Amount,
        Currency: "Indian Rupee",
      },
    },
  });
});
