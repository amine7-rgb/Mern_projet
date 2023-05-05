

// module.exports = productCtrl
const Products = require('../models/productModel')

// Filter, sorting and paginating

class APIfeatures {
    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }
    filtering(){
       const queryObj = {...this.queryString} //queryString = req.query

       const excludedFields = ['page', 'sort', 'limit']
       excludedFields.forEach(el => delete(queryObj[el]))
       
       let queryStr = JSON.stringify(queryObj)
       queryStr = queryStr.replace(/\b(gte|gt|lt|lte|regex)\b/g, match => '$' + match)


       this.query.find(JSON.parse(queryStr))
         
       return this;
    }

    sorting(){
        if(this.queryString.sort){
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }else{
            this.query = this.query.sort('-createdAt')
        }

        return this;
    }

    paginating(){
        const page = this.queryString.page * 1 || 1
        const limit = this.queryString.limit * 1 || 9
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit)
        return this;
    }
}

const productCtrl = {
    getProducts: async(req, res) =>{
        try {
            const features = new APIfeatures(Products.find(), req.query)
            .filtering().sorting().paginating()

            const products = await features.query

            res.json({
                status: 'success',
                result: products.length,
                products: products
            })
            
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
    createProduct: async(req, res) =>{
        try {
            const {product_id,addedBy, title, price, description, content, images, category} = req.body;
         //   if(!images) return res.status(400).json({msg: "No image upload"})

            const product = await Products.findOne({product_id})
            if(product)
                return res.status(400).json({msg: "This product already exists."})

            const newProduct = new Products({
                product_id,addedBy:addedBy, title: title.toLowerCase(), price, description, content, images, category
            })
            

            await newProduct.save()
            res.json({msg: "Created a product"})

        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    
      
    deleteProduct: async(req, res) =>{
        try {
            await Products.findByIdAndDelete(req.params.id)
            res.json({msg: "Deleted a Product"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    updateProduct: async(req, res) =>{
        try {
            const {title, price, description, content, images, category} = req.body;
            //if(!images) return res.status(400).json({msg: "No image upload"})

            await Products.findOneAndUpdate({_id: req.params.id}, {
                title: title.toLowerCase(), price, description, content, images, category
            })

            res.json({msg: "Updated a Product"})
        } catch (err) {
            return res.status(500).json({msg: err.message})
        }
    },
    getTopProducts: async (req, res) => {
        const MIN_RATING = 4; // Set minimum rating threshold
        try {
            const products = await Products.find({ rating: { $gt: MIN_RATING } })
                .sort({ rating: -1 })
                .limit(3);
            
            if (products.length === 0) {
                return res.status(404).json({ message: "No products found" });
            }
            
            return res.json( {products: products});
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: "Server error" });
        }
    },

      
 
createProductReview: async (req, res) => {
    const { _id, rating, comment } = req.body;
  
    try {
      const product = await Products.findById(_id);
  
      const review = {
        rating: Number(rating),
        comment,
        
      };
  
      product.reviews.push(review);
      product.numReviews = product.reviews.length;
  
      const ratingSum = product.reviews.reduce((acc, item) => acc + item.rating, 0);
      product.rating = ratingSum / product.reviews.length;
  
      await product.save();
  
      res.status(201).json({ message: 'Review added' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
}

}


module.exports = productCtrl
