var mongoose = require('mongoose');
var Counter = require('./Counter');

// schema
var postqnaSchema = mongoose.Schema({
  title:{type:String, required:[true,'Title is required!']},
  body:{type:String, required:[true,'Body is required!']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  // author:{type:String, ref:'user', required:true},
  views:{type:Number, default:0}, //조회수를 위한 views항목 추가
  numId:{type:Number},            //numId 항목 추가
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

postqnaSchema.pre('save', async function (next){
  var post = this;
  if(post.isNew){
    counter = await Counter.findOne({name:'postsqna'}).exec();
    if(!counter) counter = await Counter.create({name:'postsqna'});
    counter.count++;
    counter.save();
    post.numId = counter.count;
  }
  return next();
});


// model & export
var Postqna = mongoose.model('postqna',postqnaSchema)
module.exports = Postqna;
//module.exports = Post_qna;
