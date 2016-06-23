/*
 *	The Mobile Clients Grants Model manage the 
 *	authorizations for the mobile clients
 */

var moongose = require('mongoose');

module.exports = moongose.model('oauthMobileRefreshTokens', {
    refreshToken: {type: String, index: true},
    clientId: {type: String},
    biinName: {type: String},
    creationDate: {type: Date}
});
