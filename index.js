var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport');
var util = require('./util');
var app = express();
// var cellTester = require('./routes/users');

require('dotenv').config();

// const fastcsv = require("fast-csv");
// const fs = require("fs");
// const ws = fs.createWriteStream("bezkoder_mongodb_fastcsv.csv");

// DB setting
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

var db_name = process.env.DB_URL
let url = "mongodb://localhost:27017/dalhav";

mongoose.connect(db_name, { useNewUrlParser: true, useUnifiedTopology: true });

var db = mongoose.connection;
db.once('open', function () {
  console.log('DB connected');
});
db.on('error', function (err) {
  console.log('DB ERROR : ', err);
});

// Other settings
app.set('view engine', 'ejs');
//app.use(express.static(__dirname+'/public'));
app.use(express.static(__dirname));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(flash());
app.use(session({ secret: 'MySecret', resave: true, saveUninitialized: true }));


// Passport
app.use(passport.initialize());
app.use(passport.session());

// Custom Middlewares
app.use(function (req, res, next) {
  res.locals.isAuthenticated = req.isAuthenticated();
  res.locals.currentUser = req.user;
  res.locals.util = util;
  next();
});

// Routes
app.use('/', require('./routes/home'));
app.use('/posts', util.getPostQueryString, require('./routes/posts'));
app.use('/qna', util.getPostQueryString, require('./routes/postsqna'));
app.use('/users', require('./routes/users'));
app.use('/files', require('./routes/files')); // 1
app.use('/comments', util.getPostQueryString, require('./routes/comments'));

// Port setting
// var port = 8000;
var port = process.env.SV_PORT;
app.listen(port, function () {
  console.log('server on! http://localhost:' + process.env.SV_PORT);
});
