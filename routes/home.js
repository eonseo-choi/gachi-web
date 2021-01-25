var express = require('express');
var router = express.Router();
var passport = require('../config/passport');


var accountSid = 'AC4b35f652d89269c280ec201bdc72230c';
var authToken = '11057e06b3c5ec710e1563664a2fb0df';

var client = require('twilio')(accountSid, authToken);

// Home
router.get('/', function(req, res){
  res.render('home/welcome');
});
router.get('/about', function(req, res){
  res.render('home/about');
});


// Login
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});


// Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;
    var isSmsValid = true;

  //   client.messages
  //   .create({
  //    body: 'SMS 인증번호 : 1234 ',
  //    from: '+15203415545',
  //    to: '+821054587465'
  //    })
  //  .then(message => console.log(message.sid));

    if(!req.body.username){
      isValid = false;
      errors.username = 'ID를 입력해주세요.';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = '비밀번호를 입력해주세요.';
    }

    if(!req.body.sms){
      isSmsValid = false;
      errors.sms = '인증번호를 입력해주세요.';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login'
  }
));

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
