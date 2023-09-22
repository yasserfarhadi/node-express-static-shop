const path = require('node:path');
const express = require('express');
const bodyParser = require('body-parser');
const { mongoConnect } = require('./utils/database');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { get404 } = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd() + '/src/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use((req, res, next) => {
  User.findById('650dc2b296050e14e2c54228')
    .then((user) => {
      req.user = new User(user.name, user.email, user.cart, user._id);
      next();
    })
    .catch();
});

app.use(shopRoutes);
app.use('/admin', adminRoutes);
app.use(get404);

mongoConnect().then(() => {
  User.findById('650dc2b296050e14e2c54228')
    .then((user) => {
      if (!user) {
        const user = new User('bbk', 'bbk@bbk.com');
        return user.save();
      }
    })
    .then((user) => {
      app.listen(9000);
    });
});
