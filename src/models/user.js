const { Schema, model } = require('mongoose');
const Order = require('../models/order');

const UserSchema = Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
      },
    ],
  },
});

UserSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex((cp) => {
    return cp.productId.toString() === product._id.toString();
  });
  let newQty = 1;
  const updatedCartItems = [...this.cart.items];
  if (cartProductIndex >= 0) {
    newQty = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQty;
  } else {
    updatedCartItems.push({
      productId: product._id,
      quantity: newQty,
    });
  }
  const updatedCart = {
    items: updatedCartItems,
  };
  this.cart = updatedCart;

  return this.save();
};

UserSchema.methods.deleteFromCart = function (id) {
  const updatedCartItems = this.cart.items.filter(
    (prod) => prod.productId.toString() !== id
  );
  this.cart = { ...this.cart, items: updatedCartItems };

  return this.save();
};

UserSchema.methods.clearCart = function () {
  this.cart = { items: [] };
  return this.save();
};

module.exports = model('User', UserSchema);
