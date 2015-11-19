var mongoose = require('mongoose'),
	bcrypt= require('bcrypt'),
	SALT_WORK_FACTOR=10;

var Schema = mongoose.Schema;
var clientSchema = new Schema({
	name: {type:String, required:true,index:{unique:true}},
	password:{type:String, required:true},
	displayName:{type:String, default:""},
	lastName:{type:String, default:""},
	phoneNumber:{type:String, default:""},
	addres:{type:String, default:""},
	accountIdentifier:{type:String, default:""},
	emails:[],
	joinDate:{type:Date, default:""},
	profilePhoto:{type:String, default:""},
	defaultOrganization:{type:String,default:""},
	accountState:{type:Boolean,default:false},
    selectedOrganization:{type:String,default:""}
})

//Generation of Salt Password
clientSchema.pre('save', function(next) {
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

clientSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
	    if (err) return cb(err);
	    cb(null, isMatch);
	});
};

module.exports = mongoose.model('clients',clientSchema);