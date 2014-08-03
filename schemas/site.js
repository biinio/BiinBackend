var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var siteObj ={
	identifier:{type:String, default:"-1", index:true},
	accountIdentifier:{type:String, default:"000"},
	organizationIdentifier:{type:String,default:""},
	name: {type:String, default:""},
	description: {type:String, default:""},
	mayor:{type:Number,default:0},
	categories:[],
	media:[
			{
				identifier:{type:String,default:""},
				imgUrl:{type:String,default:""}
			}
		],
	biins:[]
}

var siteSchema = new Schema(siteObj);

module.exports = mongoose.model('sites', siteSchema);