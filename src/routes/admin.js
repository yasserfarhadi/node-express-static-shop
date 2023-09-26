const express = require('express');
const router = express.Router();
const isAuth = require('../middleware/isAuth');

const {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getProducts,
  postDeleteProduct,
} = require('../controllers/admin');

router.get('/add-product', isAuth, getAddProduct);

router.post('/add-product', isAuth, postAddProduct);

router.get('/edit-product/:productId', isAuth, getEditProduct);

router.post('/edit-product', isAuth, postEditProduct);

router.get('/products', isAuth, getProducts);

router.post('/delete-product', isAuth, postDeleteProduct);

module.exports = router;
