const express = require("express");
const Gate = require("../model/gateModel");

const route = express.Router();

route.get("/", async function (req, res, next) {
  //  return gate status TRUE or False
  const gate = await Gate.findOne({ id: "12345" }).select("Open -_id");
  res.json({
    gate: gate.Open,
  });
});

// Updated the gateOpen as true
route.get("/open", async function (req, res, next) {
  console.log("calling gate open API");
  const gate = await Gate.findOneAndUpdate({ id: "12345" }, { Open: true }, { new: true });
  res.json({
    gate,
  });
});

// Updtes the gateOpen as false
route.get("/close", async function (req, res, next) {
  const gate = await Gate.findOneAndUpdate({ id: "12345" }, { Open: false }, { new: true });
  res.json({
    gate,
  });
});

module.exports = route;
