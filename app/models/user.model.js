const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");


const Usershema = new mongoose.Schema({
    googleId: String,
    username: String,
    email: String,
    password: String,
    isVerified: Boolean,
    cin : Number , 
    age:Number,
    numtel:Number,
    sexe: { type: String, enum: ['homme', 'femme'], required: true },
    photo : String , 
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role"
      }
    ],
    resetPasswordToken: String,
    resetPasswordExpires: Date
  });

  Usershema.plugin(findOrCreate);

module.exports = mongoose.model("User", Usershema );