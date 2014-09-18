/*
 *	The Mobile Clients Grants Model manage the 
 *	authorizations for the mobile clients
 */

var moongose = require('mongoose');

module.exports = moongose.model('oauthMobileAccesTokens',{
	token:{type:String, index:true},
	expirationDate:{type:Date},
	clientId:{type:String},
	biinName:{type:String},
	creationDate:{type:Date}
});