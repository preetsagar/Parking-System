const Slot = require("../model/slotModel");
const ParkingName = require("../model/parkingNameModel");
const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");

exports.createSlot = catchAsync(async (req, res, next) => {
  const newSlot = await Slot.create(req.body);
  res.status(201).json({
    status: "Success",
    data: {
      data: newSlot,
    },
  });
});

exports.getAllSlots = catchAsync(async (req, res, next) => {
  const slots = await Slot.find().populate("parkingId");
  res.status(200).json({
    status: "Success",
    result: slots.length,
    data: {
      data: slots,
    },
  });
});

exports.deleteSlot = catchAsync(async (req, res, next) => {
  const data = await Slot.findByIdAndDelete(req.params.id);
  console.log("NKNKNKNKN");
  res.status(204).json({
    status: "Success",
    data: {
      data,
    },
  });
});

exports.getASlot = catchAsync(async (req, res, next) => {
  const slot = await Slot.findById(req.params.id).populate("parkingId");
  if (!slot) {
    return next(new AppError("No Doc Exists with this id", 400));
  }
  res.status(200).json({
    status: "Success",
    data: {
      data: slot,
    },
  });
});

exports.updateOccupancy = catchAsync(async (req, res, next) => {
  const isOccupied = {};
  isOccupied.isOccupied = req.body.isOccupied;
  const slot = await Slot.findByIdAndUpdate(req.params.id, isOccupied, { new: true, runValidators: true }).populate(
    "parkingId"
  );
  if (!slot) {
    return next(new AppError("No doc exists with this id", 400));
  }
  return res.status(200).json({
    status: "Success",
    data: {
      data: slot,
    },
  });
});

exports.updateAssigned = catchAsync(async (req, res, next) => {
  const isAssigned = {};
  isAssigned.isAssigned = req.body.isAssigned;
  const slot = await Slot.findByIdAndUpdate(req.params.id, isAssigned, { new: true, runValidators: true }).populate(
    "parkingId"
  );
  if (!slot) {
    return next(new AppError("No doc exists with this id", 400));
  }
  res.status(200).json({
    status: "Success",
    data: {
      data: slot,
    },
  });
});

exports.getSlotByParkingId = catchAsync(async (req, res, next) => {
  const slots = await Slot.find({ parkingId: req.params.parkingId }).populate("parkingId");
  res.status(200).json({
    status: "Success",
    result: slots.length,
    data: {
      data: slots,
    },
  });
});

exports.getEmptySlotByParkingId = catchAsync(async (req, res, next) => {
  const slots = await Slot.find({ parkingId: req.params.parkingId, isOccupied: false, isAssigned: false }).populate(
    "parkingId"
  );
  res.status(200).json({
    status: "Success",
    result: slots.length,
    data: {
      data: slots,
    },
  });
});

exports.getAllEmptySlots = catchAsync(async (req, res, next) => {
  const slots = await Slot.find({ isOccupied: false, isAssigned: false }).populate("parkingId");
  res.status(200).json({
    status: "Success",
    result: slots.length,
    data: {
      data: slots,
    },
  });
});
