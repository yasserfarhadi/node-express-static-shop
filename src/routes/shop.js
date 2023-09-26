const express = require('express');
const {
  getProducts,
  getCart,
  getIndex,
  getCheckout,
  getOrders,
  getProduct,
  postCart,
  postCartDeleteItem,
  postOrder,
} = require('../controllers/shop');

const router = express.Router();
const isAuth = require('../middleware/isAuth');

router.get('/', getIndex);

router.get('/products', getProducts);

router.get('/products/:productId', getProduct);

router.get('/cart', isAuth, getCart);

router.post('/cart', isAuth, postCart);

router.post('/cart-delete-item', isAuth, postCartDeleteItem);

router.get('/orders', isAuth, getOrders);

router.post('/create-order', isAuth, postOrder);

// router.get('/checkout', getCheckout);

// router.get("/product-detailt", getProductDetail)

module.exports = router;
