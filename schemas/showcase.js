var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var showcaseSchema = new Schema( {
	identifier:{ type: String, index: true },
	customerIdentifier: String,
	organizationIdentifier: String,
	type:{type:Number},
	title1:String,
	title2:String,
	title3:String,
	title1Color:String,
	title2Color:String,
	title3Color:String,
	title1Size:String,
	title2Size:String,
	title3Size:String,
	showcaseDescription:String,
	mainImageUrl: String,
	objects:[
		{
			objectIdentifier:String,
			position:Number,
			type:{type:Number},
			likes:String,
            title1:String,
	        title2:String,
	        title1Color:String,
	        title2Color:String,
	        title1Size:String,
	        title2Size:String,
			objectDescription:String,
			actionType:Number,
			originalPrice:String,
			biinPrice:String,
			discount:String,
			savings:String,
			biinSold:String,
			timeFrame:String,
			imageUrl:String,
			categories:[]
		}
	]
});

module.exports = mongoose.model('showcases', showcaseSchema);