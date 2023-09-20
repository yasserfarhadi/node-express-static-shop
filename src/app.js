const path = require('node:path');
const express = require('express');
const bodyParser = require('body-parser');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const { get404 } = require('./controllers/error');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd() + '/src/views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(shopRoutes);
app.use('/admin', adminRoutes);
app.use(get404);

app.listen(9000);
