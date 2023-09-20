const fs = require('node:fs');
const path = require('node:path');

const cartDataPath = path.join(process.cwd(), 'src', 'data', 'cart.json');

module.exports = class Cart {
  static addProduct(id, productPrice) {
    // fetch the previous cart
    fs.readFile(cartDataPath, (err, fileContent) => {
      let cart = { products: [], totalPrice: 0 };
      if (!err && fileContent.length !== 0) {
        cart = JSON.parse(fileContent);
      }
      // analuze cart => find existing product
      const existingProductIndex = cart.products.findIndex(
        (product) => product.id === id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;
      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;
        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id, qty: 1 };
        // cart.products = [...cart.products, ]
        cart.products = [...cart.products, updatedProduct];
      }
      cart.totalPrice = cart.totalPrice + +productPrice;
      fs.writeFile(cartDataPath, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
    // add new product / increase quntity
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(cartDataPath, (err, fileContent) => {
      if (err) return;
      const updateCart = { ...JSON.parse(fileContent) };
      const product = updateCart.products.find((prod) => prod.id === id);
      if (!product) {
        return;
      }
      const qty = product.qty;
      updateCart.products = updateCart.products.filter(
        (prod) => prod.id !== id
      );
      updateCart.totalPrice -= productPrice * qty;
      fs.writeFile(cartDataPath, JSON.stringify(updateCart), (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  }

  static getCart(cb) {
    fs.readFile(cartDataPath, (err, fileContent) => {
      if (!err && fileContent.length !== 0) {
        const cart = JSON.parse(fileContent);
        cb(cart);
      } else {
        cb([]);
      }
    });
  }
};
