var path = require('path');
var express = require('express');
var multer = require('multer');
var bodyParser = require('body-parser');
var app = express();
var expressLayouts = require('express-ejs-layouts');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('express-flash');
var mongoose = require('mongoose');
require('./src/models');

mongoose.connect('mongodb://localhost:27017/libraryApp', function(err) {
    if (err) throw err;
});

var port = process.env.PORT || 5000;

app.use(expressLayouts);
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(session({
    secret: 'thesecret',
    resave: 'true',
    saveUninitialized: 'true'
}));
app.use(flash());
require('./src/config/passport')(app);

app.use(function(req, res, next) {
    res.locals.login = req.isAuthenticated();
    next();
});

app.set('views', path.join(__dirname, 'src', 'views'));
app.set('layout', 'layout');
app.set('view engine', 'ejs');

function loggedIn(req, res, next) {
    if (!req.user) {
        res.redirect('/auth/signin');
    } else {
        next();
    }
}

//include the routes file
var users = require('./src/routes/users')();
var authRoutes = require('./src/routes/authRoutes')();
var autofillRoutes = require('./src/routes/autofill')();
var formatterRoutes = require('./src/routes/formatter')();
////////
app.use('/users', loggedIn, users);
app.use('/auth', authRoutes);
app.use('/autofill', loggedIn, autofillRoutes);
app.use('/formatter', loggedIn, formatterRoutes);
app.get('/', function(req, res) {
    res.render('index', {
        nav: "transparent"
    });
});
app.get('/test', function(req, res) {
  res.render('test');
});
app.listen(port, function(err) {
    if (err)
        console.log(err);
    else
        console.log('running server on port: ' + port);
});
