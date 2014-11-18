var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var stickerObj={
	identifier:{type: String, index: true, default:"-1"},
	title1:{type:String, default:""},
	title2:{type:String,default:""},
	color:{type:String, default:""}
};
var stickerSchema = new Schema(stickerObj);
module.exports = mongoose.model('sticker', stickerSchema);