const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sgMail = require('@sendgrid/mail');
const firebase = require('firebase');
require('firebase/auth');

const authMiddleware = require('./auth');
const blogPostsRouter = require('./routes/blogPosts');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

// Setup firebase
const firebaseConfig = {
  apiKey: "AIzaSyDC34NWdWHh5pFJwV731aS1AOJok0kV11Q",
  authDomain: "blogbs-461l.firebaseapp.com",
  databaseURL: "https://blogbs-461l.firebaseio.com",
  projectId: "blogbs-461l",
  storageBucket: "blogbs-461l.appspot.com",
  messagingSenderId: "850995431128",
  appId: "1:850995431128:web:1ef5ccbe07c3356d8c39ad"
};

firebase.initializeApp(firebaseConfig);
const provider = new firebase.auth.GoogleAuthProvider();

// Setup sendgrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(authMiddleware);
app.use((req, res, next) => {
  req.sgMail = sgMail;
  next();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/blogposts', blogPostsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
