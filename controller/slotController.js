const Slot = require("../model/slotModel");
const ParkingName = require("../model/parkingNameModel");
const catchAsync = require("../util/catchAsync");
const AppError = require("../util/appError");

exports.createSlot = catchAsync(async (req, res, next) => {
  // check parking slots id is valid or not
  let result = await ParkingName.find({ _id: req.body.parkingId });
  if (!result.length) {
    return next(new AppError("Parking Id is not valid", 400));
  }
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
  const slot = await Slot.findByIdAndUpdate(req.body.slotId, isOccupied, { new: true, runValidators: true }).populate(
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
  const slot = await Slot.findByIdAndUpdate(req.body.slotId, isAssigned, { new: true, runValidators: true }).populate(
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

exports.updateAllSlots = catchAsync(async (req, res, next) => {
  const data = req.body;
  Object.keys(data).forEach(async (slot) => {
    if (data[slot]) {
      await Slot.findOneAndUpdate({ slotNumber: slot }, { isOccupied: true, isAssigned: false });
    } else {
      await Slot.findOneAndUpdate({ slotNumber: slot, isAssigned: false }, { isOccupied: false, isAssigned: false });
    }
  });
  // console.log(Object.keys(data));
  // console.log(data);
  res.status(200).json({
    staus: "Success",
    data: "Updated Successhully",
  });
});
