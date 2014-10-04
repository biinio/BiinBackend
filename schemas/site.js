var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var validations={
	required :['title1','title2','mainColor','textColor','country','state','city','zipCode','streetAddres','phoneNumber','lat','lng','categories','media']
};


var siteObj ={
	identifier:{type:String, default:"-1", index:true},
	accountIdentifier:{type:String, default:"000"},
	organizationIdentifier:{type:String,default:""},
	title1:{type:String, default:""},	
	title2:{type:String, default:""},	
	mainColor:{type:String,default:""},
	textColor:{type:String,default:""},
	description: {type:String, default:""},
	major:{type: Number, default:0},
	minorCounter:{type: Number, default:0},
	country:{type:String, default:""},
	state:{type:String, default:""},
	city:{type:String, default:""},
	zipCode:{type:String, default:""},
	streetAddres:{type:String, default:""},
	phoneNumber:{type:String, default:""},
	lat:{type:String,default:0},
	lng:{type:String,default:0},
	searchTags:[],
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
			identifier:{type:String, default:""},
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
			registerDate:{type:String, Default:""},
			showcaseAsigned:{type:String, Default:""}
		}
	]
}
var siteSchema = new Schema(siteObj);

siteSchema.methods.validations = function() {
	return validations;
};

module.exports = mongoose.model('sites', siteSchema);