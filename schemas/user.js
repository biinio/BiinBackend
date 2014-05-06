var mongoose = require('mongoose'),
	bcrypt= require('bcrypt'),
	SALT_WORK_FACTOR=10;

var Schema = mongoose.Schema;
var userSchema = new Schema({
	name: {type:String, required:true,index:{unique:true}},
	password:{type:String, required:true},
	displayName:String
})

//Generation of Salt Password
userSchema.pre('save', function(next) {
	var self = this;
	// only hash the password if it has been modified (or is new)
	if (!self.isModified('password')) return next();
	 
	// generate a salt
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);
	 
	    // hash the password along with our new salt
	    bcrypt.hash(self.password, salt, function(err, hash) {
	        if (err) return next(err);
	 
	        // override the cleartext password with the hashed one
	        self.password = hash;
	        next();
   		});
	});
});

userSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
	    if (err) return cb(err);
	    cb(null, isMatch);
	});
};

module.exports = mongoose.model('users',userSchema);