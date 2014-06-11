var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var showcaseSchema = new Schema( {
	identifier:{ type: String, index: true },
	customerIdentifier: String,
	organizationIdentifier: String,
	showcaseType:{type:String},
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
	pushNotification:String,
	objects:[
		{
			objectIdentifier:String,
			position:String,
			objectType:{type:String},
			likes:String,
            title1:String,
	        title2:String,
	        title1Color:String,
	        title2Color:String,
	        title1Size:String,
	        title2Size:String,
			objectDescription:String,
			actionType:String,
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