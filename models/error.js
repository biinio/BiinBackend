var mongoose = require('mongoose');

module.exports = mongoose.model('errors', {
	code:String,
	title:String,
	description:String,
	proximityUUID:String,
	region:String,
	issueDate:String
});