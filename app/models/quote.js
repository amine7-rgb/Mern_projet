 const mongoose = require('mongoose');


// const quoteSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   product: {
//     type: String,
//     required: true,
//   },
//   groundSurface: {
//     type: Number,
//     required: true,
//     validate: {
//       validator: function (value) {
//         return value > 0;
//       },
//       message: 'Ground surface must be greater than 0'
//     }
//   },
//   sensorsNeeded: {
//     type: Number,
//     required: true,
//   },
  
//   // price: {
//   //   type: Number,
//   //   required: true,
//   // }
// });

// module.exports = mongoose.model('Quote', quoteSchema);
const quoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  product: {
    type: String,
    required: true,
  },
  groundSurface: {
    type: Number,
    required: true,
    validate: {
      validator: function (value) {
        return value > 0;
      },
      message: 'Ground surface must be greater than 0'
    }
  },
  sensorsNeeded: {
    type: Number,
    required: true,
  },
  // price: {
  //   type: Number,
  //   // required: true,
  // }
});

module.exports = mongoose.model('Quote', quoteSchema);
