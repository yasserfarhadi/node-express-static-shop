const Product = require('../models/product');

module.exports.getIndex = (req, res, next) => {
  Product.fetchAll()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(console.log);
};

module.exports.getProducts = (_req, res, _next) => {
  Product.fetchAll().then((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
    });
  });
};

module.exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      res.render('shop/product-detail', {
        product: product,
        path: '/products',
        pageTitle: product.title,
      });
    })
    .catch(console.log);
};

module.exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((products) => {
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
      });
    })
    .catch(console.log);
};

module.exports.postCart = (req, res, next) => {
  // req.user.c
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch(console.log);
};

// TODO
// module.exports.getCheckout = (req, res, next) => {
//   render('shop/checkout', {
//     path: '/checkout',
//     pageTitle: 'Checkout',
//   });
// };

module.exports.getOrders = (req, res, next) => {
  req.user
    .getOrders()
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
      });
    })
    .catch(console.log);
};

module.exports.postOrder = (req, res, next) => {
  req.user
    .addOrder()
    .then((result) => {
      res.redirect('/orders');
    })
    .catch(console.log);
};

module.exports.postCartDeleteItem = (req, res, next) => {
  const id = req.body.productId;
  req.user
    .deleteItemFromCart(id)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch(console.log);
};
