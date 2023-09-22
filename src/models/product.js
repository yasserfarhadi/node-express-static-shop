const { ObjectId } = require('mongodb');
const { getDb } = require('../utils/database');

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this._id = id ? new ObjectId(id) : null;
    this.userId = userId;
  }

  save() {
    const db = getDb();
    let dbOp;
    if (this._id) {
      dbOp = db.collection('products').updateOne(
        { _id: this._id },
        {
          $set: this,
        }
      );
    } else {
      dbOp = db.collection('products').insertOne(this);
    }
    return dbOp.then(console.log).catch(console.log);
  }

  static fetchAll() {
    const db = getDb();
    return db
      .collection('products')
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch();
  }

  static findById(id) {
    const db = getDb();
    return db
      .collection('products')
      .find({ _id: new ObjectId(id) })
      .next()
      .then((product) => {
        return product;
      })
      .catch(console.log);
  }

  static deleteById(id) {
    const db = getDb();
    return db
      .collection('products')
      .deleteOne({ _id: new ObjectId(id) })
      .then((result) => {
        console.log('Deleted');
        return result;
      })
      .catch(console.log);
  }
}

module.exports = Product;
