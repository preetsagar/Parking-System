const Slot = require("../model/slotModel");
const Transaction = require("../model/transactionModel");
const User = require("../model/userModel");
const UserTransaction = require("../model/userTransactionHistoryModel");
const slotRoute = require("../route/slotRoute");
const Razorpay = require("razorpay");
const axios = require("axios");

const AppError = require("../util/appError");
const catchAsync = require("../util/catchAsync");
const { json } = require("body-parser");

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

  // check weather the vehicle is already parked or not
  const data = await Transaction.findOne({ vehicleNo: req.body.vehicleNo, isComplete: false });
  if (data) {
    return next(new AppError("This vehicle is already parked", 400));
  }

  //  IF Slot no is provided in body
  if (req.body.slot) {
    // slot is given in body
    slot = await Slot.findById(req.body.slot);
    if (!slot) {
      return next(new AppError("Please enter correct Slot ID", 400));
    } else if (slot.isOccupied || slot.isAssigned) {
      return next(new AppError("Slot is already Occupied", 400));
    } else {
      slot = req.body.slot;
    }
  } else {
    // slot is not given in body so assign a slot
    slot = await Slot.find({ isOccupied: false, isAssigned: false });
    if (!slot.length) {
      return next(new AppError("No slots are available", 400));
    } else {
      slotDetails = slot[0];
      slot = slot[0]._id;
    }
  }

  // UPDATE slot as occupied
  slot = await Slot.findByIdAndUpdate(slot, { isOccupied: true }, { new: true, runValidators: true });

  //   find if the vehicle is registered or not if user is a registered user then update the user field in the transaction
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
    // Call API to notify google ///////////////////////////////////////////////////////////////////
    var axios = require("axios");
    var data2 = JSON.stringify({
      to: user[0].fcmToken,
      // to: "epL0sxcCQXKNiCmFqzo8Tl:APA91bGrePATwA0Wm8qvHIIBZfShjHoA6K40FfPBTe9MiPBgNS-bYLCgsNTXzF1SnpzT6TsXd_KVNI2Mr7Ni7ePPXaLogf1iPRVEori-B7kJS4wNLH8nYM-1HJnBv73We2X7hvEoDNgk",
      collapse_key: "type_a",
      priority: "high",
      notification: {
        body: `You have been Assigned slot ${slot.slotNumber}`,
        title: "Slot Details",
      },
    });

    var config2 = {
      method: "post",
      url: "https://fcm.googleapis.com/fcm/send",
      headers: {
        Authorization:
          "key=AAAAneK6m5Q:APA91bGi8G2jTPHZjwoECoLrF9dZVbOZ2gnylpjBbe2EkaeNPHsWgbi4Yzv-MUTJNdctTLPqxxIhiV-2Z6dVeah1ndzuw7g2I4Oo7pxi22k4T2JS9IIgDQuyqt-QiBmjAf5vIeQ_8xmX",
        "Content-Type": "application/json",
      },
      data: data2,
    };

    axios(config2)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });
    // ////////////////////////////////////////////////////////////////////////////////////////////////////////
  } else {
    body = {
      slot: slot,
      vehicleNo: req.body.vehicleNo,
      inTime: new Date().toISOString(),
    };
  }
  // CREATE a transaction
  let transaction = {};
  transaction = await Transaction.create(body);
  // console.log(transaction);

  // Call API TO OPEN GATE
  let data1 = JSON.stringify({
    value: "OPEN",
  });
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://io.adafruit.com/api/v2/parking00/feeds/sw1/data?x=OPEN",
    headers: {
      "X-AIO-Key": "aio_cHXc27a0VSyhxaf3Nc8nLkFpkfaP",
      "Content-Type": "application/json",
    },
    data: data1,
  };
  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });

  // SEND the response
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

exports.createRazorPayOrder = catchAsync(async (req, res, next) => {
  var instance = new Razorpay({ key_id: "rzp_test_Oi69HJagINaREZ", key_secret: "V8bz7OLp4lriREQl4xDPsSEa" });

  const { amount } = req.body;

  var options = {
    amount: amount * 100, // amount in the Paisa
    currency: "INR",
  };
  // console.log(options);
  let response;
  instance.orders.create(options, function (err, order) {
    if (err) {
      // console.log(err);
      response = err;
      res.status(400).json({
        status: "Fail",
        data: response,
      });
    } else {
      // console.log(order);
      response = order;
      res.status(201).json({
        status: "Success",
        data: response,
      });
    }
  });
});

exports.getPayment = catchAsync(async (req, res, next) => {
  // SEACRCH THE TRANSACTION BASED ON Vehicle Number
  const transaction = await Transaction.find({
    vehicleNo: req.params.vehicleNo,
    isComplete: false,
  });

  // transaction not found - return error
  if (!transaction.length) {
    return next(new AppError("Please Enter Correct Vehicle No", 400));
  }

  // Calculate Amount
  let inTime = new Date(transaction[0].inTime).getTime();
  let outTime = new Date().getTime();
  let stayTime = (outTime - inTime) / 1000; // In HOURS
  console.log("StayTime = ", stayTime);
  // PAYMENT 1rs per sec
  let Amount = Number(stayTime * 1).toFixed(2);

  Amount = Math.max(Amount, 5);

  // IF TRANSACTION HAS user field
  if (transaction[0].user) {
    var flag = 0;
    await User.findOne({ _id: transaction[0].user }).then(async (response) => {
      // console.log(response);
      // console.log("Balcance  = ", response.Balance);
      // console.log("Amount = ", Amount);

      // IF USER has sufficient balance
      if (response.Balance >= Amount) {
        const run = async () => {
          // console.log("run called");
          // Update Current Transaction as Complete
          await Transaction.findByIdAndUpdate(transaction[0]._id, {
            outTime: new Date().toISOString(),
            amount: Amount,
            isComplete: true,
          });

          // Update the current slot as unoccupied
          await Slot.findByIdAndUpdate(
            transaction[0].slot,
            { isOccupied: false, isAssigned: false },
            { new: true, runValidators: true }
          );

          // Update the user with the new Balance
          await User.findOneAndUpdate({ _id: transaction[0].user }, { Balance: response.Balance - Amount });

          // Call API TO OPEN GATE
          let data1 = JSON.stringify({
            value: "OPEN",
          });
          let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: "https://io.adafruit.com/api/v2/parking00/feeds/sw1/data?x=OPEN",
            headers: {
              "X-AIO-Key": "aio_bUKL28724ACOCykOgSQphouWkzfK",
              "Content-Type": "application/json",
            },
            data: data1,
          };
          axios
            .request(config)
            .then((response) => {
              console.log(JSON.stringify(response.data));
            })
            .catch((error) => {
              console.log(error);
            });
        };
        await run();
        flag = 1;
        // console.log(flag);
      }
    });
    if (flag == 1) {
      return res.render("success-page");
    }
  }

  // After Getting the Amount Create a order in RAZORPAY
  var instance = new Razorpay({ key_id: "rzp_test_Oi69HJagINaREZ", key_secret: "V8bz7OLp4lriREQl4xDPsSEa" });

  var options = {
    amount: Number(Amount) * 100, // amount in the Paisa
    currency: "INR",
  };
  // console.log(options);

  // Create RazorPay Instance
  let response;
  instance.orders.create(options, function (err, order) {
    if (err) {
      // console.log(err);
      response = err;
      res.status(400).json({
        status: "Fail",
        data: response,
      });
    } else {
      response = order;
      response.amount = Amount * 100;
      response.vehicleNo = req.params.vehicleNo;
      // RENDER the PAYMENT PAGE
      res.render("payment", { data: response });
    }
  });
});

exports.updateTransactionAndSlotAsUnoccupied = catchAsync(async (req, res, next) => {
  let vehicleNo = req.body.vehicleNo;
  const amount = req.body.amount;
  const transaction = await Transaction.find({
    vehicleNo: vehicleNo,
    isComplete: false,
  });

  // Update Current Transaction as Complete
  await Transaction.findByIdAndUpdate(transaction[0]._id, {
    outTime: new Date().toISOString(),
    amount: amount,
    isComplete: true,
  });

  // Update the current slot as unoccupied
  const slot = await Slot.findByIdAndUpdate(
    transaction[0].slot,
    { isOccupied: false, isAssigned: false },
    { new: true, runValidators: true }
  );

  res.status(200).json({ status: "Success" });
});
