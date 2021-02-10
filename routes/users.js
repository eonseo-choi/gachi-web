var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');
var fastcsv = require('fast-csv');
var mongodb = require('mongodb').MongoClient
var fs = require('fs');
var ws = fs.createWriteStream('userdbtest.hwp');
require('dotenv').config();

var accountSid = process.env.TWILIO_ACCOUNTSID;
var authToken = process.env.TWILIO_AUTHTOKEN;

var client = require('twilio')(accountSid, authToken);
var ran;
let url = "mongodb://localhost:27017/";

// ////////////////////////////////////////////
// var tttt = (function($){ 
//   ttttt = $('#cellnum').val();
//  });
// var test123 = global.document.getElementsByName('cellnum');
////////////////////////////////////////////
function getRandomInt() { //min ~ max 사이의 임의의 정수 반환
  var min = 11111
  var max = 99999
  return Math.floor(Math.random() * (max - min)) + min;
}

  
function expCSV() {
  mongodb.connect(
    url,
    { useNewUrlParser: true, useUnifiedTopology: true },
    (err, client) => {
      if (err) throw err;

      client
        .db("dalhav")
        .collection("users")
        .find({})
        .toArray((err, data) => {
          if (err) throw err;

          console.log(data);
          fastcsv
            .write(data, { headers: true })
            .on("finish", function () {
              console.log("Write to bezkoder_mongodb_fastcsv.csv successfully!");
            })
            .pipe(ws);

          client.close();
        });
    }
  );
}


//Auth
router.get('/auth', function (req, res) {

  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};

  //console.log("email :", req.param('cellnum')); 
  res.render('users/auth', { user: user, errors: errors });
});

//valAuth
router.get('/valAuth', function (req, res) {

  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};

  // console.log(ttt);

  // 인증코드 전송 누를 시 각자 다른 번호가 전송됨
  ran = String(getRandomInt());

  function sendMessage() {
    client.messages
      .create({
        body: 'SMS 인증번호 : ' + ran,
        from: '+15203415545',
        to: '+821054587465'
        //to : '+82'+cellnum
      })
      .then(message => console.log(message.sid));
    return ran;
  }
  expCSV();
  sendMessage();
  // res.render('users/valAuth', { user: user, errors: errors,cellnum: req.flash.cellnum });
  res.render('users/valAuth', { user: user, errors: errors });

});

// New
router.get('/new', function (req, res) {

  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/new', { user: user, errors: errors });
});

// create
router.post('/', function (req, res) {
  User.create(req.body, function (err, user) {
    if (err) {
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/');
  });
});

// show
router.get('/:username', util.isLoggedin, checkPermission, function (req, res) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.json(err);
    res.render('users/show', { user: user });
  });
});

// edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function (req, res) {
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if (!user) {
    User.findOne({ username: req.params.username }, function (err, user) {
      if (err) return res.json(err);
      res.render('users/edit', { username: req.params.username, user: user, errors: errors });
    });
  }
  else {
    res.render('users/edit', { username: req.params.username, user: user, errors: errors });
  }
});

// update
router.put('/:username', util.isLoggedin, checkPermission, function (req, res, next) {
  User.findOne({ username: req.params.username })
    .select('password')
    .exec(function (err, user) {
      if (err) return res.json(err);

      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword ? req.body.newPassword : user.password;
      for (var p in req.body) {
        user[p] = req.body[p];
      }

      // save updated user
      user.save(function (err, user) {
        if (err) {
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/' + req.params.username + '/edit');
        }
        res.redirect('/users/' + user.username);
      });
    });
});

module.exports = router;

// private functions
function checkPermission(req, res, next) {
  User.findOne({ username: req.params.username }, function (err, user) {
    if (err) return res.json(err);
    if (user.id != req.user.id) return util.noPermission(req, res);

    next();
  });
}
