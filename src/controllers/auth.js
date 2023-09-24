const User = require('../models/user');

module.exports.getLogin = (req, res, next) => {
  // const isLoggedIn =
  //   req.get('Cookie')?.split(';')[0].trim().split('=')[1] === 'true';
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    isAuthenticated: req.session.isLoggedIn,
  });
};

module.exports.postLogin = (req, res, next) => {
  User.findById('651054aadf17bd1821891ae4').then((user) => {
    req.session.isLoggedIn = true;
    req.session.user = user;
    req.session.save((err) => {
      console.log(err);
      res.redirect('/');
    });
  });
};

module.exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect('/');
  });
};
