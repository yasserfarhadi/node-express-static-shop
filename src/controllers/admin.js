const Product = require('../models/product');

module.exports.getAddProduct = (_req, res, _next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
  });
};

module.exports.getProducts = (req, res, next) => {
  req.user
    .getProducts()
    .then((products) => {
      res.render('admin/products', {
        pageTitle: 'Admin Products',
        path: '/admin/products',
        prods: products,
      });
    })
    .catch(console.log);
};

module.exports.postAddProduct = (req, res, _next) => {
  const { title, imageUrl, description, price } = req.body;
  req.user
    .createProduct({
      title,
      description,
      imageUrl,
      price,
    })
    .then(() => {
      res.redirect('/');
    })
    .catch(console.log);
};

module.exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === 'true';
  if (!editMode) {
    return res.redirect('/');
  }
  const id = req.params.productId;
  req.user
    .getProducts({
      where: {
        id,
      },
    })
    .then((products) => {
      const product = products[0];
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
      });
    })
    .catch(console.log);
};

module.exports.postEditProduct = (req, res, next) => {
  const { title, imageUrl, description, price, productId } = req.body;
  Product.findByPk(productId)
    .then((product) => {
      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;
      return product.save();
    })
    .then((result) => {
      res.redirect('/admin/products');
    });
};

module.exports.postDeleteProduct = (req, res, next) => {
  const id = req.body.productId;
  Product.findByPk(id)
    .then((product) => {
      return product.destroy();
    })
    .then((result) => {
      console.log(`product with id: ${id} deleted!`, result);
      res.redirect('/admin/products');
    })
    .catch(console.log);
};
