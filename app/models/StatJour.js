const mongoose = require("mongoose");

const  StatJour = mongoose.model(
  "StatJour",
  new mongoose.Schema({
    temp: Number,
    humidityN: Number,
    humidityS: Number,
    tempPoump:Number,
    date:Date
  })
);

module.exports = StatJour;