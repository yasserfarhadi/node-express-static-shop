module.exports.get404 = (req, res, next) => {
  res.status(404).render('404', {
    pageTitle: 'Not Found',
    path: 'not-found',
    isAuthenticated: req.session.isLoggedIn,
  });
};
module.exports.get500 = (req, res, next) => {
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn,
  });
};
