const Transaction = require("../model/transactionModel");
const UserTransaction = require("../model/userTransactionHistoryModel");
const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");
const User = require("./../model/userModel");

exports.getAllUser = catchAsync(async (req, res, next) => {
  //   const users = await User.find();
  const users = await User.find();
  res.status(200).json({
    staus: "Success",
    result: users.length,
    data: {
      data: users,
    },
  });
});

// -------------------Handles duplicate Vehicle Number Registration-----------------------
exports.createUser = catchAsync(async (req, res, next) => {
  const newUserData = {};
  newUserData.name = req.body.name;
  newUserData.email = req.body.email;
  newUserData.vehicleNo = req.body.vehicleNo;

  const promises = newUserData.vehicleNo.map((number) => {
    return new Promise(async (resolve, reject) => {
      const users = await User.find({ vehicleNo: number });
      if (users.length) {
        reject("reject");
      } else {
        resolve("resolved");
      }
    });
  });

  Promise.all(promises)
    .then(async () => {
      try {
        const newUser = await User.create(newUserData);
        res.status(201).json({
          status: "Success",
          data: {
            data: newUser,
          },
        });
      } catch (err) {
        next(err);
      }
    })
    .catch(() => {
      return next(new AppError("Vehicle Already Registered", 400));
    });
});

exports.getAUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError("No user Exists with this ID", 400));
  } else {
    res.status(200).json({
      status: "Success",
      data: {
        data: user,
      },
    });
  }
});

exports.getTransactionHistiory = catchAsync(async (req, res, next) => {
  const userTransaction = await Transaction.find({ user: req.params.id });
  // console.log(userTransaction);
  res.status(200).json({
    status: "Success",
    result: userTransaction.length,
    data: {
      data: userTransaction,
    },
  });
});
