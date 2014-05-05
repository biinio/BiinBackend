var mongoose = require('mongoose');

module.exports = mongoose.model('User',{
	id:Number,
	name: String,
	password:String
});