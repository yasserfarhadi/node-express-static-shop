const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
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

router.post(
  '/add-product',
  [
    body('title', 'Title should have atleast 3 and less then 50 characters')
      .isString()
      .trim()
      .isLength({ min: 3, max: 50 }),
    body('imageUrl', 'image url is not valid!').isURL(),
    body('price', 'price number you entered is not valid').isFloat(),
    body(
      'description',
      'description must be atleast 10 and less then 200 characters!'
    )
      .trim()
      .isLength({ min: 10, max: 200 }),
  ],
  isAuth,
  postAddProduct
);

router.get('/edit-product/:productId', isAuth, getEditProduct);

router.post(
  '/edit-product',
  [
    body('title', 'Title should have atleast 3 and less then 50 characters')
      .isString()
      .trim()
      .isLength({ min: 3, max: 50 }),
    body('imageUrl', 'image url is not valid!').isURL(),
    body('price', 'price number you entered is not valid').isFloat(),
    body(
      'description',
      'description must be atleast 10 and less then 200 characters!'
    )
      .trim()
      .isLength({ min: 10, max: 200 }),
  ],
  isAuth,
  postEditProduct
);

router.get('/products', isAuth, getProducts);

router.post('/delete-product', isAuth, postDeleteProduct);

module.exports = router;
