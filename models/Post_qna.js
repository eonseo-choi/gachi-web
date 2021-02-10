var mongoose = require('mongoose');

// schema
var postqnaSchema = mongoose.Schema({
  title:{type:String, required:[true,'Title is required!']},
  body:{type:String, required:[true,'Body is required!']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  attachment:{type:mongoose.Schema.Types.ObjectId, ref:'file'},
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});



// model & export
var Post_qna = mongoose.model('post_qna',postqnaSchema)
module.exports = Post_qna;
//module.exports = Post_qna;
