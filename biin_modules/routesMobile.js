/*

	Routes intented for the MOBILE BIIN API

*/

//MOBILE/API/...
module.exports = function(app,db, passport,multipartMiddleware){
	
	var oauthMobileAPIGrants = require('../routes/oauthMobileAPIGrants')();	
	app.put('/mobile/client/grant',oauthMobileAPIGrants.set);
}
