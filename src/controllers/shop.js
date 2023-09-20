const Product = require('../models/product');
const Cart = require('../models/cart');

module.exports.getIndex = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/',
    });
  });
};

module.exports.getProducts = (_req, res, _next) => {
  Product.fetchAll((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
    });
  });
};

module.exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId, (product) => {
    res.render('shop/product-detail', {
      product,
      path: '/products',
      pageTitle: product.title,
    });
  });
};

module.exports.getCart = (req, res, next) => {
  Cart.getCart((cart) => {
    if (cart) {
      Product.fetchAll((products) => {
        const productsInCart = [];
        for (const product of products) {
          const prod = cart.products.find((prod) => prod.id === product.id);
          if (prod)
            productsInCart.push({ productData: product, qty: prod.qty });
        }
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: productsInCart,
        });
      });
    }
  });
};

module.exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId, ({ price }) => {
    Cart.addProduct(prodId, price);
  });
  res.redirect('/cart');
};

module.exports.getCheckout = (req, res, next) => {
  render('shop/checkout', {
    path: '/checkout',
    pageTitle: 'Checkout',
  });
};

module.exports.getOrders = (req, res, next) => {
  res.render('shop/orders', {
    path: '/orders',
    pageTitle: 'Your Orders',
  });
};

module.exports.postCartDeleteItem = (req, res, next) => {
  const id = req.body.productId;
  Product.findById(id, (product) => {
    Cart.deleteProduct(id, product.price);
    res.redirect('/cart');
  });
};
