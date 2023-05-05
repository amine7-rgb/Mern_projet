const mongoose = require("mongoose");

const Temp = mongoose.model(
  "Temp",
  new mongoose.Schema({
    temp: Number,
    date:Date
  })
);

module.exports = Temp;