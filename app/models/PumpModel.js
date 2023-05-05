const mongoose = require("mongoose");

const Pump = mongoose.model(
  "Pump",
  new mongoose.Schema({
    temp: Number,
    date:Date
  })
);

module.exports = Pump;