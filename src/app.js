const path = require('node:path');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDbStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

const User = require('./models/user');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const { get404, get500 } = require('./controllers/error');

const MONGODB_URI = 'mongodb://127.0.0.1:27017/shop';
const fileStorate = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd() + '/src/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(
  multer({ storage: fileStorate, fileFilter: fileFilter }).single('image')
);
app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/images', express.static(path.join(process.cwd(), 'images')));
app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store,
  })
);

app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(shopRoutes);
app.use('/admin', adminRoutes);
app.use(authRoutes);
app.get('/500', get500);
app.use(get404);

app.use((error, req, res, next) => {
  console.log({ error });
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
  });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(9000);
  })
  .catch(console.log);
