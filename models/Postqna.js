var mongoose = require('mongoose');

// schema
var postqnaSchema = mongoose.Schema({
  title:{type:String, required:[true,'Title is required!']},
  body:{type:String, required:[true,'Body is required!']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  // author:{type:String, ref:'user', required:true},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

// model & export
var Postqna = mongoose.model('postqna',postqnaSchema)
module.exports = Postqna;
//module.exports = Post_qna;
