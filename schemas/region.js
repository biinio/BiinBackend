var mongoose = require('mongoose');

module.exports = mongoose.model('regions', {
	identifier: String,
	radious: String,
	latitude:String,
	longitude:String,
	sites:[{
		identifier:{type:String, index:true},
		categories:[
			{
				identifier:{type:String, index:true, default:"-1"},
				name:{type:String, default:""},
				displayName:{type:String, default:""},
				imgUrl:{type:String, default:""}
			}
		]		
	}],
	sitesCount:String,
	biins:[
		{
			identifier:String,
			major:String,
			minor:String,
			proximityUUID:String,
			lastUpdate:String,
			showcaseIdentifier:String
		}
	]	
});