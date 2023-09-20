const fs = require('node:fs');
const path = require('node:path');
const Cart = require('./cart');

const productsDataPath = path.join(
  process.cwd(),
  'src',
  'data',
  'products.json'
);
const getProductsFromFile = (cb) => {
  fs.readFile(productsDataPath, (err, fileContent) => {
    if (err || fileContent.length === 0) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(title, imageUrl, description, price, id) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }
  save() {
    getProductsFromFile((products) => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          (prod) => prod.id === this.id
        );
        const updatedProducts = [...products];
        updatedProducts[existingProductIndex] = this;
        fs.writeFile(
          productsDataPath,
          JSON.stringify(updatedProducts),
          console.log
        );
      } else {
        this.id = Math.random().toString();
        products.push(this);
        fs.writeFile(productsDataPath, JSON.stringify(products), console.log);
      }
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
    // const fileContent = fs.readFileSync(p);

    // return fileContent.length > 0 ? JSON.parse(fileContent) : [];
  }

  static findById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id);
      cb(product);
    });
  }

  static deleteById(id, cb) {
    getProductsFromFile((products) => {
      const product = products.find((prod) => prod.id === id);
      const updatedProduct = products.filter((prod) => prod.id !== id);
      fs.writeFile(productsDataPath, JSON.stringify(updatedProduct), (err) => {
        if (err) {
          console.log(err);
        } else {
          Cart.deleteProduct(id, product.price);
          cb(id);
        }
      });
    });
  }
};
