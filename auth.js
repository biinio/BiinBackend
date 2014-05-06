
var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	userSchema = require('./schemas/user');


passport.use(new LocalStrategy(
	function(username, password, done) {

		//var user = userSchema.find();
		userSchema.findOne({ name: username},function (err, user) {
		  if (user.password==password)
			return done(null, user);
			
		return done(null, false);
		});
		
		/*
		*/
	}
));

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, {name: user.name,displayName:user.displayName});
});

module.exports = passport;