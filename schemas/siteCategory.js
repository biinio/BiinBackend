var mongoose = require('mongoose');

var siteCatObj = {
	radious: String,
	min_latitude:{type:String},
	min_logitude:{type:String},
	max_latitude:{type:String},
	max_logitude:{type:String},
	categoryIdentifier:{type:String:index:true},
	sites:[{
		identifier:{type:String, index:true}
	}],
	sitesCount:String	
}
var siteCatSchema = new Schema(siteObj);
siteCatSchema.index({ min_latitude: 1, min_logitude: 1,max_latitude:1,max_logitude:1,categoryIdentifier:1 }, { unique: true })

module.exports = mongoose.model('siteCategories', siteCatSchema);

