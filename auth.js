
//Passport Login

var passport = require('passport'),
	LocalStrategy = require('passport-local').Strategy,
	userSchema = require('./schemas/user');


passport.use(new LocalStrategy(
	function(username, password, done) {

		//var user = userSchema.find();
		userSchema.findOne({ name: username},function (err, user) {

		if(user!=null && user!=undefined){
			//Test the Password 
			user.comparePassword(password, function(err, isMatch) {
			    if (err) throw err;		   
			    if (isMatch)
					return done(null, user);
			});			
		}
		else
		{
			return done(null, false);
		}
	});	
})
);

passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(user, done) {
	done(null, {name: user.name,displayName:user.displayName});
});

module.exports = passport;