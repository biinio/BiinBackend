var mongoose = require('mongoose');

module.exports = mongoose.model('showcases', {
	title: String,
	description: String	
});