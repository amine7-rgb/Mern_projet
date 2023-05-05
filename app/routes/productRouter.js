const router = require('express').Router()
const productCtrl = require('../controllers/productCtrl')
const { fileUpload } = require('../middleware/multer')



router.route('/products')
    .get(productCtrl.getProducts)
    .post(
         productCtrl.createProduct)


router.route('/products/:id')
    .delete( productCtrl.deleteProduct)
    .put(productCtrl.updateProduct)
router.post('/products/reviews', productCtrl.createProductReview);
router.get('/top-products', productCtrl.getTopProducts);
module.exports = router
