const express = require('express');
const router = express.Router();

const {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getProducts,
  postDeleteProduct,
} = require('../controllers/admin');

router.get('/add-product', getAddProduct);

router.post('/add-product', postAddProduct);

router.get('/edit-product/:productId', getEditProduct);

router.post('/edit-product', postEditProduct);

router.get('/products', getProducts);

router.post('/delete-product', postDeleteProduct);

module.exports = router;
