var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var showcaseObj={
	identifier:{ type: String, index: true, default:"-1"},
	customerIdentifier:{type:String, default:""},
	organizationIdentifier:{type:String, default:""},
	showcaseType:{type:String, default:""},
	title1:{type:String, default:""},
	title2:{type:String, default:""},
	title3:{type:String, default:""},
	title1Color:{type:String, default:""},
	title2Color:{type:String, default:""},
	title3Color:{type:String, default:""},
	title1Size:{type:String, default:""},
	title2Size:{type:String, default:""},
	title3Size:{type:String, default:""},
	showcaseDescription:{type:String, default:""},
	mainImageUrl:{type:String, default:""},
	pushNotification:{type:String, default:""},
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
};
var showcaseSchema = new Schema(showcaseObj);
showcaseSchema.methods.createNew = function() {	
	return new showcaseObj();
};
module.exports = mongoose.model('showcases', showcaseSchema);