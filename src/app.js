const path = require('node:path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { get404 } = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd() + '/src/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use((req, res, next) => {
  User.findById('651054aadf17bd1821891ae4')
    .then((user) => {
      req.user = user;
      next();
    })
    .catch(console.log);
});

app.use(shopRoutes);
app.use('/admin', adminRoutes);
app.use(get404);

mongoose
  .connect('mongodb://127.0.0.1:27017/shop')
  .then((result) => {
    User.findOne()
      .then((user) => {
        if (!user) {
          const user = new User({
            name: 'bbk',
            email: 'bbk@bbk.com',
            cart: { items: [] },
          });
          user.save();
        }
        return user;
      })
      .then(() => {
        console.log('connected to db');
        app.listen(9000);
        console.log('server started at port 9000');
      });
  })
  .catch(console.log);
