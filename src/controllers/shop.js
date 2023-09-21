const Product = require('../models/product');

module.exports.getIndex = (req, res, next) => {
  Product.findAll()
    .then((products) => {
      console.log(products);
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
      });
    })
    .catch(console.log);
};

module.exports.getProducts = (_req, res, _next) => {
  Product.findAll().then((products) => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products',
    });
  });
};

module.exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findAll({ where: { id: prodId } })
    .then((products) => {
      res.render('shop/product-detail', {
        product: products[0],
        path: '/products',
        pageTitle: products[0].title,
      });
    })
    .catch(console.log);

  // Product.findByPk(prodId)
  //   .then((product) => {
  //     res.render('shop/product-detail', {
  //       product: product,
  //       path: '/products',
  //       pageTitle: product.title,
  //     });
  //   })
  //   .catch(console.log);
};

module.exports.getCart = (req, res, next) => {
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts().then((products) => {
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
        });
      });
    })
    .catch(console.log);
};

module.exports.postCart = (req, res, next) => {
  // req.user.c
  const prodId = req.body.productId;
  let fetchedCart;
  let newQty = 1;
  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts({
        where: {
          id: prodId,
        },
      });
    })
    .then((products) => {
      let product;
      if (products.length > 0) {
        product = products[0];
      }

      if (product) {
        const oldQty = product.cartItem.quantity;
        newQty = oldQty + 1;
        return product;
      }
      return Product.findByPk(prodId);
    })
    .then((product) => {
      return fetchedCart.addProduct(product, {
        through: { quantity: newQty },
      });
    })
    .then(() => {
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
    .getOrders({ include: ['products'] })
    .then((orders) => {
      console.log(orders[0].products[0].title);
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders,
      });
    })
    .catch(console.log);
};

module.exports.postOrder = (req, res, next) => {
  let fetchedCart;

  req.user
    .getCart()
    .then((cart) => {
      fetchedCart = cart;
      return cart.getProducts();
    })
    .then((products) => {
      return req.user
        .createOrder()
        .then((order) => {
          order.addProducts(
            products.map((product) => {
              product.orderItem = { quantity: product.cartItem.quantity };
              return product;
            })
          );
        })
        .catch(console.log);
    })
    .then(() => {
      fetchedCart.setProducts(null);
    })
    .then((result) => {
      res.redirect('/orders');
    })
    .catch(console.log);
};

module.exports.postCartDeleteItem = (req, res, next) => {
  const id = req.body.productId;
  req.user
    .getCart()
    .then((cart) => {
      return cart.getProducts({ where: { id } });
    })
    .then((products) => {
      const product = products[0];
      return product.cartItem.destroy();
    })
    .then((result) => {
      res.redirect('/cart');
    })
    .catch(console.log);
};
