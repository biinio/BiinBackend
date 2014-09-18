/*
 *	The Mobile Clients Grants Model manage the 
 *	authorizations for the mobile clients
 */

var moongose = require('mongoose');

module.exports = moongose.model('oauthMobileAPIGrants',{
	clientIdentifier:{type:String, index:true},
	clientSecret:{type:String},
	trustedClient:{type:Number, default:1},
	creationDate:{type:Date}
});