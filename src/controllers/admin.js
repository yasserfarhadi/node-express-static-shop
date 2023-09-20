const Product = require('../models/product');

module.exports.getAddProduct = (_req, res, _next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

module.exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      pageTitle: 'Admin Products',
      path: '/admin/products',
      prods: products,
    });
  });
};

module.exports.postAddProduct = (req, res, _next) => {
  const { title, imageUrl, description, price } = req.body;
  const product = new Product(title, imageUrl, description, price, null);
  product.save();
  res.redirect('/');
};

module.exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === 'true';
  if (!editMode) {
    return res.redirect('/');
  }
  const id = req.params.productId;
  Product.findById(id, (product) => {
    if (!product) {
      return res.redirect('/');
    }
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product,
    });
  });
};

module.exports.postEditProduct = (req, res, next) => {
  const { title, imageUrl, description, price, productId } = req.body;
  const updatedProduct = new Product(
    title,
    imageUrl,
    description,
    price,
    productId
  );
  updatedProduct.save();
  res.redirect('/admin/products');
};

module.exports.postDeleteProduct = (req, res, next) => {
  console.log('hit');
  const id = req.body.productId;
  Product.deleteById(id, (id) => {
    console.log(`product with id: ${id} deleted!`);
    res.redirect('/admin/products');
  });
};
