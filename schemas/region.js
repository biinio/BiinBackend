var mongoose = require('mongoose');

module.exports = mongoose.model('regions', {
	identifier: String,
	radious: Number,
	latitude:Number,
	longitude:Number,
	biins:[
		{
			identifier:String,
			major:Number,
			minor:Number,
			proximityUUID:String,
			lastUpdate:String,
			showcaseIdentifier:String
		}
	]	
});