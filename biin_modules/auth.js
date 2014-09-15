
//Passport Login
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	clientSchema = require('../schemas/client');
var util = require('util');


passport.use('clientLocal',new LocalStrategy(
		function(clientName, password, done) {

			//var user = userSchema.find();
			clientSchema.findOne({ name: clientName},function (err, client) {

			if(client!=null && client!=undefined){
				//Test the Password 
				client.comparePassword(password, function(err, isMatch) {
				    if (err) throw err;		   
				    if (isMatch)
						return done(null, client);
					else
						return done(null, false);					
				});			
			}else{
				return done(null, false);			
			}
			
		});	
	})
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, new clientSchema(user));
});

module.exports = passport;