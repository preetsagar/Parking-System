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
  const userTransaction = await Transaction.find({ user: req.params.id, isComplete: true });
  // console.log(userTransaction);
  res.status(200).json({
    status: "Success",
    result: userTransaction.length,
    data: {
      data: userTransaction,
    },
  });
});

exports.addMoneyToWallet = catchAsync(async (req, res, next) => {
  const { userId, amount } = req.body;
  // console.log(userId, amount);
  let user = await User.findOne({ _id: userId });
  if (!user) {
    return next(new AppError("Please enter correct User Id", 400));
  }

  const newBalance = user.Balance + amount;
  user = await User.findByIdAndUpdate({ _id: userId }, { Balance: newBalance }, { new: true });

  res.status(200).json({
    status: "Success",
    data: {
      data: {
        user,
      },
    },
  });
});

exports.addVehicle = catchAsync(async (req, res, next) => {
  const { userId, vehicleNo } = req.body;

  let user = await User.findOne({ _id: userId });
  if (!user) {
    return next(new AppError("Please Enter correct userId", 400));
  }

  const vehicle = await User.findOne({ vehicleNo: vehicleNo });
  if (vehicle) {
    return next(new AppError("Vehicle is already Registered", 400));
  }

  const newData = user.vehicleNo;
  newData.push(vehicleNo);
  user = await User.findOneAndUpdate({ _id: userId }, { vehicleNo: newData }, { new: true });

  res.status(200).json({
    status: "Success",
    data: {
      data: user,
    },
  });
});

exports.removeVehicle = catchAsync(async (req, res, next) => {
  const { userId, vehicleNo } = req.body;

  let user = await User.findOne({ _id: userId, vehicleNo: vehicleNo });
  if (!user) {
    return next(new AppError("Please Enter correct details", 400));
  }

  const newData = user.vehicleNo.filter((vehicle) => vehicle !== vehicleNo);
  user = await User.findOneAndUpdate({ _id: userId }, { vehicleNo: newData }, { new: true });

  res.status(200).json({
    status: "Success",
    data: {
      data: user,
    },
  });
});
