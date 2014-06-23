var moongose = require('moongose');

module.exports = moongose.model('biins',{
			identifier:String,
			major:String,
			minor:String,
			proximityUUID:String,
			lastUpdate:String
});