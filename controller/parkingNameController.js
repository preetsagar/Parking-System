const catchAsync = require("../util/catchAsync");
const ParkingName = require("../model/parkingNameModel");

exports.getAllParkingName = catchAsync(async (req, res, next) => {
  const parkingNames = await ParkingName.find();
  res.status(200).json({
    status: "Success",
    result: parkingNames.length,
    data: {
      data: parkingNames,
    },
  });
});

exports.createParking = catchAsync(async (req, res, next) => {
  const newData = await ParkingName.create(req.body);
  res.status(201).json({
    status: "Success",
    data: {
      data: newData,
    },
  });
});

// exports.deleteParking =
