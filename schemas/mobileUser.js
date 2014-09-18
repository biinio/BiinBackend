var mongoose = require('mongoose');

module.exports = mongoose.model('mobileUsers',{
	firstName: String,
	lastName:String,
	biinName:String,
	password:String,
	birthDate:String,
	gender:String,
	joinDate:String,
	leftDate:String,
	accountState:String,
	thirdPartyAccounts:[{
		type:String,
		accountIdentifier:String,
		email:String,
		token:String,
		RefreshToken:String,
		expireDate:String,
	}],
	//Activity of the user in the app
	actvityHistory:[]
});
