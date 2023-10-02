const fs = require('node:fs');
const path = require('node:path');
const Product = require('../models/product');
const Order = require('../models/order');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')(
  'sk_test_51NwsGyEdowDWv87YTimFzyZCfYRzgBqcEzs2D4x0jZtDr71rW45dNKyFSxCoQYzyQAk6nubbMyccb4eEWjxJ28lm00U7bu2f2i'
);

const ITEMS_PER_PAGE = 1;

module.exports.getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()
    .then((numberOfProducts) => {
      totalItems = numberOfProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevioud: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
    .countDocuments()

    .then((numberOfItems) => {
      totalItems = numberOfItems;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products) => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPrevioud: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.getCheckout = (req, res, next) => {
  let products;
  let total = 0;
  req.user
    .populate('cart.items.productId')
    .then((user) => {
      products = user.cart.items;
      total = 0;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      return Promise.all(
        products.map((p) =>
          stripe.products.create({
            description: p.productId.description,
            name: p.productId.title,
          })
        )
      );
    })
    .then((productList) => {
      console.log(productList);
      return Promise.all(
        products.map((p, idx) =>
          stripe.prices.create({
            unit_amount: p.quantity * p.productId.price * 100,
            currency: 'usd',
            product: productList[idx].id,
          })
        )
      );
    })
    .then((prices) => {
      console.log(prices);
      console.log('two');
      let total;
      prices.forEach((p) => {
        total += p.unit_amount;
      });
      return stripe.checkout.sessions.create({
        // payment_method_types: ['card'],
        mode: 'payment',
        line_items: products.map((p, idx) => {
          return {
            // name: p.productId.title,
            // description: p.productId.description,
            price: prices[idx].id,
            // currency: 'usd',
            quantity: p.quantity,
          };
        }),
        success_url:
          req.protocol + '://' + req.get('host') + '/checkout/success',
        cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel',
      });
    })
    .then((session) => {
      console.log('three');
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'Checkout',
        products: products,
        totalSum: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
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
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.getCheckoutSuccess = (req, res, next) => {
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
      })
      .catch((err) => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        next(error);
      });
  });
};
// module.exports.postOrder = (req, res, next) => {
//   req.user.populate('cart.items.productId').then((user) => {
//     const products = user.cart.items.map((item) => {
//       const product = { ...item.productId._doc };
//       product.productId = product._id;
//       return {
//         quantity: item.quantity,
//         product,
//       };
//     });
//     const order = new Order({
//       user: {
//         email: req.user.email,
//         userId: req.user._id,
//       },
//       products,
//     });

//     order
//       .save()
//       .then((result) => {
//         return req.user.clearCart();
//       })
//       .then((result) => {
//         res.redirect('/orders');
//       })
//       .catch((err) => {
//         const error = new Error(err);
//         error.httpStatusCode = 500;
//         next(error);
//       });
//   });
// };

module.exports.postCartDeleteItem = (req, res, next) => {
  const id = req.body.productId;
  req.user
    .deleteFromCart(id)
    .then((result) => {
      res.redirect('/cart');
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

module.exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error('No order found!'));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }
      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join(
        process.cwd(),
        'data',
        'invoices',
        invoiceName
      );

      const pdf = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);

      pdf.pipe(fs.createWriteStream(invoicePath));
      pdf.pipe(res);

      pdf.fontSize(26).text('Invoice', {
        underline: true,
      });

      pdf.text('-------------------------------------');
      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.product.price * prod.quantity;
        pdf
          .fontSize(14)
          .text(
            `${prod.product.title} - ${prod.quantity} * $${prod.product.price}`
          );
      });
      pdf.text('-------------------------------------');
      pdf.fontSize(20).text('Total Price: $' + totalPrice);

      pdf.end();

      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }
      //   res.setHeader('Content-Type', 'application/pdf');
      //   res.setHeader(
      //     'Content-Disposition',
      //     `inline; filename="${invoiceName}"`
      //   );
      //   res.send(data);
      // });

      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);
      // file.pipe(res);
    })
    .catch((err) => next(err));
};
