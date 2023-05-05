const mongoose = require("mongoose");

const HumidityNormal = mongoose.model(
  "HumidityNormal",
  new mongoose.Schema({
    humidity: Number,
    date:Date
  })
);

module.exports = HumidityNormal;