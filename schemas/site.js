var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var siteObj ={
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
}

var siteSchema = new Schema(siteObj);

module.exports = mongoose.model('sites', siteSchema);