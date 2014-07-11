var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orgObj ={
	identifier:{type:String, default:"-1"},
	accountIdentifier:{type:String, default:"000"},
	name: {type:String, default:""},
	brand: {type:String, default:""},
	description: {type:String, default:""},
	imgUrl:{type:String,default:""},
	sites:[{
		identifier:{type:String, default:"-1"},
		accountIdentifier:{type:String, default:"000"},
		organizationIdentifier:{type:String,default:""},
		name: {type:String, default:""},
		description: {type:String, default:""},
		media:[
			{
			 title1:{type:String, default:""},
			 title1:{type:String, default:""},
			 imgUrl:{type:String,default:""}
			}
			]
	}]
}

var orgSchema = new Schema(orgObj);

module.exports = mongoose.model('organizations', orgSchema);