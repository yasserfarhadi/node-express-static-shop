const Product = require('../models/product');
const Order = require('../models/order');
const product = require('../models/product');

module.exports.getIndex = (req, res, next) => {
  console.log(req.csrfToken());
  Product.find()
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(console.log);
};

module.exports.getProducts = (req, res, _next) => {
  Product.find().then((products) => {
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
    .populate('cart.items.productId')
    .then((user) => {
      const products = user.cart.items;
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
  Order.find({ 'user.userId': req.user._id })
    .then((orders) => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
      });
    })
    .catch(console.log);
};

module.exports.postOrder = (req, res, next) => {
  req.user.populate('cart.items.productId').then((user) => {
    const products = user.cart.items.map((item) => {
      const product = { ...item.productId._doc };
      product.productId = product._id;
      return {
        quantity: item.quantity,
        product,
      };
    });
    const order = new Order({
      user: {
        email: req.user.email,
        userId: req.user._id,
      },
      products,
    });

    order
      .save()
      .then((result) => {
        return req.user.clearCart();
      })
      .then((result) => {
        res.redirect('/orders');
      });
  });
};

module.exports.postCartDeleteItem = (req, res, next) => {
  const id = req.body.productId;
  req.user
    .deleteFromCart(id)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch(console.log);
};
