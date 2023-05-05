const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema(
    {
      name: { type: String, required: false},
      rating: { type: Number },
      comment: { type: String },
 
    },
    {
      timestamps: true,
    }
  )
  
  
const productSchema = new mongoose.Schema({
    product_id:{
        type: String,
        unique: true,
        trim: true,
   
    },
    title:{
        type: String,
        trim: true,
   
    },
    price:{
        type: Number,
        trim: true,
      
    },
    description:{
        type: String,
    
    },
    content:{
        type: String,
       
    },
    images:{
        type: Object,
    
    },
    category:{
        type: String,
   
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
   
      default: 0,
    },
    numReviews: {
      type: Number,
  
      default: 0,
    },
    checked:{
        type: Boolean,
        default: false
    },
    solde: {
        type: Number,
        default: 0
      },
      codePromo: {
        type: String,
      
      },
      soldeReduction: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 100,
      },
}, {
    timestamps: true //important
})


module.exports = mongoose.model("Products", productSchema)