const Product = require('../models/product');
const { validationResult } = require('express-validator');

module.exports.getAddProduct = (req, res, _next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

module.exports.postAddProduct = (req, res, _next) => {
  const { title, imageUrl, description, price } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      product: { title, imageUrl, description, price },
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const userId = req.user._id;
  const product = new Product({ title, price, description, imageUrl, userId });
  product
    .save()
    .then(() => {
      res.redirect('/');
    })
    .catch(console.log);
};

module.exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === 'true';
  if (!editMode) {
    return res.redirect('/');
  }

  const id = req.params.productId;
  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        errorMessage: null,
        validationErrors: [],
      });
    })
    .catch(console.log);
};

module.exports.postEditProduct = (req, res, next) => {
  const { title, imageUrl, description, price, productId } = req.body;
  Product.findById(productId)
    .then((product) => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
          pageTitle: 'Edit Product',
          path: '/admin/add-product',
          editing: true,
          product: { _id: productId, title, price, description, imageUrl },
          hasError: true,
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array(),
        });
      }
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save().then((result) => {
        console.log('Product Updated!');
        res.redirect('/admin/products');
      });
    })

    .catch(console.log);
};

module.exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.productId;
  Product.deleteOne({ _id: id, userId: req.user._id })
    .then((result) => {
      res.redirect('/admin/products');
    })
    .catch(console.log);
};

module.exports.getProducts = (req, res, next) => {
  Product.find({ userId: req.user._id })
    // .select("title price -_id")
    // .populate('userId', "name" )
    .then((products) => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        prods: products,
      });
    })
    .catch(console.log);
};
