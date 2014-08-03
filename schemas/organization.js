var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orgObj ={
	identifier:{type:String, default:"-1", index:true},
	accountIdentifier:{type:String, default:"000"},
	name: {type:String, default:""},
	title1:{type:String, default:""},
	title1:{type:String, default:""},
	brand: {type:String, default:""},
	description: {type:String, default:""},
	imgUrl:{type:String,default:""},
	sites:[{
		identifier:{type:String, default:"-1", index:true},
		accountIdentifier:{type:String, default:"000"},
		organizationIdentifier:{type:String,default:""},
		name: {type:String, default:""},
		description: {type:String, default:""},
		categories:[
			{
				identifier:{type:String, index:true, default:"-1"},
				name:{type:String, default:""},
				displayName:{type:String, default:""},
				imgUrl:{type:String, default:""}
			}
		],
		media:[
			{
				title1:{type:String, default:""},
				title1:{type:String, default:""},
				imgUrl:{type:String,default:""}
			}
		],
		biins:[
			{
				identifier:{type:String, index:true, Default:""},
				name:{type:String, Default:""},
				major:{type:String, Default:""},
				minor:{type:String, Default:""},
				proximityUUID:{type:String, Default:""},
				location:{type:String, Default:""},
				registerDate:{type:String, Default:""}
			}
		]
	}]
}

var orgSchema = new Schema(orgObj);

module.exports = mongoose.model('organizations', orgSchema);