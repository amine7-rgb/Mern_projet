const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    isVerified: Boolean,
    photo : String , 
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
  })
);

module.exports = User;