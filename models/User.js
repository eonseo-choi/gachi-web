var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

var accountSid = 'AC4b35f652d89269c280ec201bdc72230c';
var authToken = '11057e06b3c5ec710e1563664a2fb0df';

var client = require('twilio')(accountSid, authToken);

ran = String(getRandomInt());

function getRandomInt() { //min ~ max 사이의 임의의 정수 반환
  var min = 11111
  var max = 99999
  return Math.floor(Math.random() * (max - min)) + min;
}

//sendMessage();
(function sendMessage() { 
    client.messages
    .create({
     body: 'SMS 인증번호 : '+ ran,
     from: '+15203415545',
     to: '+821054587465'
     })
   .then(message => console.log(message.sid));
  return ran;
});



// schema
var userSchema = mongoose.Schema({
  username:{
    type:String,
    required:[true,'ID를 입력해주세요.'],
    match:[/^.{3,12}$/,'3자 이상 12자 이하를 입력하세요.'],
    trim:true,
    unique:true
  },
  password:{
    type:String,
    required:[true,'비밀번호를 입력해주세요.'],
    select:false
  },
  name:{
    type:String,
    required:[true,'이름을 입력해주세요.'],
    match:[/^.{2,12}$/,'2자 이상 12자 이하를 입력하세요.'],
    trim:true
  },
  email:{
    type:String,
    required:[true,'e-mail을 입력해주세요.'],
    match:[/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,'이메일 형식에 맞추어 입력해주세요.'],
    trim:true
  }
},{
  toObject:{virtuals:true}
});

// virtuals
userSchema.virtual('passwordConfirmation')
  .get(function(){ return this._passwordConfirmation; })
  .set(function(value){ this._passwordConfirmation=value; });

userSchema.virtual('originalPassword')
  .get(function(){ return this._originalPassword; })
  .set(function(value){ this._originalPassword=value; });

userSchema.virtual('currentPassword')
  .get(function(){ return this._currentPassword; })
  .set(function(value){ this._currentPassword=value; });

userSchema.virtual('newPassword')
  .get(function(){ return this._newPassword; })
  .set(function(value){ this._newPassword=value; });

userSchema.virtual('smsValidation')
  .get(function(){ return this._smsValidation; })
  .set(function(value){ this._smsValidation=value; });


// password validation
var passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,16}$/;
var passwordRegexErrorMessage = '비밀번호는 최소 4자 이상의 영문과 숫자의 조합으로 만들어야합니다.';
userSchema.path('password').validate(function(v) {
  var user = this;

  // create user
  if(user.isNew){
    
    if(user.smsValidation !== ran || !user.smsValidation){
      user.invalidate('sms', '인증번호가 맞지 않습니다.'+ ran)
    }
      
    if(!user.passwordConfirmation){
      user.invalidate('passwordConfirmation', '비밀번호 확인를 한번 더 입력하세요.');
    }

    if(!passwordRegex.test(user.password)){
      user.invalidate('password', passwordRegexErrorMessage);
    }
    else if(user.password !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '확인 비밀번호가 맞지 않습니다.');
    }
  }

  // update user
  if(!user.isNew){
    if(!user.currentPassword){
      user.invalidate('currentPassword', '현재 비밀번호를 입력해주세요.');
    }
    else if(!bcrypt.compareSync(user.currentPassword, user.originalPassword)){
      user.invalidate('currentPassword', '현재 비밀번호가 맞지 않습니다.');
    }

    if(user.newPassword && !passwordRegex.test(user.newPassword)){
      user.invalidate("newPassword", passwordRegexErrorMessage);
    }
    else if(user.newPassword !== user.passwordConfirmation) {
      user.invalidate('passwordConfirmation', '확인 비밀번호가 맞지 않습니다.');
    }
  }
});

// hash password
userSchema.pre('save', function (next){
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  else {
    user.password = bcrypt.hashSync(user.password);
    return next();
  }
});

// model methods
userSchema.methods.authenticate = function (password) {
  var user = this;
  return bcrypt.compareSync(password,user.password);
};

// model & export
var User = mongoose.model('user',userSchema);
module.exports = User;
