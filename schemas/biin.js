var moongose = require('mongoose');

module.exports = moongose.model('biins',{
			identifier:String,
			major:String,
			minor:String,
			proximityUUID:String,
			customerIdentifier:String,
			organizationIdentifier:String
});