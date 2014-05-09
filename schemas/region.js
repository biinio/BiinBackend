var mongoose = require('mongoose');

module.exports = mongoose.model('regions', {
	identifier: String,
	radious: String,
	latitude:String,
	longitude:String,
	biins:[
		{
			identifier:String,
			major:String,
			minor:String,
			proximityUUID:String,
			lastUpdate:String,
			showcaseIdentifier:String
		}
	]	
});