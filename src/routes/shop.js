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

router.get('/', getIndex);

router.get('/products', getProducts);

router.get('/products/:productId', getProduct);

router.get('/cart', getCart);

router.post('/cart', postCart);

router.post('/cart-delete-item', postCartDeleteItem);

router.get('/orders', getOrders);

router.post('/create-order', postOrder);

// router.get('/checkout', getCheckout);

// router.get("/product-detailt", getProductDetail)

module.exports = router;
