const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/database');

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart;
    this._id = id;
  }

  save() {
    const db = getDb();
    return db.collection('users').insertOne(this);
  }

  addToCart(product) {
    const cartProductIndex = this.cart.items.findIndex((cp) => {
      console.log('cp.productId', cp.productId);
      console.log('product._id', product._id);
      return cp.productId.toString() === product._id.toString();
    });
    let newQty = 1;
    const updatedCartItems = [...this.cart.items];
    if (cartProductIndex >= 0) {
      newQty = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQty;
    } else {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQty,
      });
    }
    const updatedCart = {
      items: updatedCartItems,
    };
    const db = getDb();
    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map((item) => item.productId);
    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then((products) => {
        return products.map((product) => {
          const qty = this.cart.items.find(
            (item) => item.productId.toString() === product._id.toString()
          ).quantity;
          return {
            ...product,
            quantity: qty,
          };
        });
      });
  }

  addOrder() {
    const db = getDb();
    return this.getCart()
      .then((products) => {
        const order = {
          items: products,
          user: {
            _id: new ObjectId(this._id),
            name: this.name,
          },
        };
        return db.collection('orders').insertOne(order);
      })
      .then((result) => {
        this.cart = { items: [] };
        return db
          .collection('users')
          .updateOne(
            { _id: new ObjectId(this._id) },
            { $set: { cart: this.cart } }
          );
      });
  }

  getOrders() {
    const db = getDb();
    return db
      .collection('orders')
      .find({ 'user._id': new ObjectId(this._id) })
      .toArray();
  }

  deleteItemFromCart(id) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(
      (prod) => prod.productId.toString() !== id
    );
    console.log('updatedCartItems.length', updatedCartItems.length);
    const updatedCart = { ...this.cart, items: updatedCartItems };

    return db
      .collection('users')
      .updateOne(
        { _id: new ObjectId(this._id) },
        { $set: { cart: updatedCart } }
      );
  }

  static findById(id) {
    const db = getDb();
    return db.collection('users').findOne({ _id: new ObjectId(id) });
  }
}

module.exports = User;
