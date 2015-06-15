var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var siteCatObj = {
	radious: Number,
	min_latitude:{type:Number},
	min_longitude:{type:Number},
	max_latitude:{type:Number},
	max_longitude:{type:Number},
	categoryIdentifier:{type:String,index:true},
	sites:[{
		identifier:{type:String, index:true},
		proximity:{type:Number, index:true},
		neighbors: [{siteIdentifier:String}]
	}],
	sitesCount:String	
}

var siteCatSchema = new Schema(siteCatObj);
siteCatSchema.index({ min_latitude: 1, min_logitude: 1,max_latitude:1,max_logitude:1,categoryIdentifier:1 }, { unique: true })
siteCatSchema.index({ 'sites.proximity': 1, identifier: 1})
module.exports = mongoose.model('searchSiteCategories', siteCatSchema);

