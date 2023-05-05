const mongoose = require("mongoose");


const Factureshema = new mongoose.Schema({
    orderId: String,
    name: String,
    lastName:String,
    email: String,
    phone: String,
    address:String,
    country : String,
    zipCode: String,
    notes : String,
    items: [
      {
        type:String ,
      }
    ],
  });


module.exports = mongoose.model("Facture", Factureshema );