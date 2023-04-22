const User = require("../model/userModel");
const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");

exports.signUp = catchAsync(async (req, res, next) => {
  const newUserData = {};
  newUserData.name = req.body.name;
  newUserData.email = req.body.email;
  newUserData.mobileNo = req.body.mobileNo;
  newUserData.Passsword = req.body.passsword;
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

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: email, Passsword: password });
  if (!user) {
    return next(new AppError("Please Enter correct email and password", 401));
  } else {
    return res.status(200).json({
      status: "Success",
      data: {
        data: user,
      },
    });
  }
});
