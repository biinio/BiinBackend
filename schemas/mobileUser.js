//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt= require('bcrypt');
//Define the validations for an organization
var validations={
	required :['firstName','lastName','biinName','password','gender'],
	len :[
			/*{field:'firstName',min:3,max:40},
			{field:'lastName',min:3,max:40},
			{field:'biinName',min:3,max:40},
			{field:'gender',min:3,max:40},
			{field:'password',min:6,max:20}*/
		],
	email:['biinName']
};

var mobileUserSchema=new Schema({
	identifier:{type:String,index:true},
	firstName: String,
	lastName:String,
	biinName:String,
	password:String,
	tempPassword:String,
	birthDate:String,
	gender:String,
	joinDate:String,
	leftDate:String,
	accountState:{type:Boolean, default:false},
	thirdPartyAccounts:[{
		type:String,
		accountIdentifier:String,
		email:String,
		token:String,
		refreshToken:String,
		expireDate:String
	}],	
	email:{type:String, default:""},
	imgUrl:{type:String, default:""},
	comments:String,
	userBiined:String,
	userCommented:String,
	userShared:String,
	biiins:{type:String, default:"0"},
	following:{type:String, default:"0"},
	followers:{type:String, default:"0"},
	friends:[],
	//Activity of the user in the app
	actvityHistory:[],
	categories:[
			{
				identifier:{type:String, index:true, default:"-1"},
				name:{type:String, default:""},
				displayName:{type:String, default:""},
				url:{type:String, default:""}
			}
	]
});

//Methods

mobileUserSchema.methods.validations = function() {
	return validations;
};

mobileUserSchema.methods.comparePassword = function(candidatePassword, cb) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
	    if (err) return cb(err);
	    cb(null, isMatch);
	});
};
module.exports = mongoose.model('mobileUsers', mobileUserSchema);
