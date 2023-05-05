const mongoose = require("mongoose");

const HumidityS = mongoose.model(
  "HumidityS",
  new mongoose.Schema({
    humidity: Number,
    date:Date
  })
);

module.exports = HumidityS;