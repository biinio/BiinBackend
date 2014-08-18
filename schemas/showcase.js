var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var showcaseObj={
	identifier:{ type: String, index: true, default:"-1"},
	accountIdentifier:{type:String, default:"000"},
	organizationIdentifier:{type:String, default:""},
	siteIdentifier:{type:String,default:""},
	showcaseType:{type:String, default:""},
	showcaseDescription:{type:String, default:""},
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
			]
		}
	]
};
var showcaseSchema = new Schema(showcaseObj);
showcaseSchema.methods.createNew = function() {	
	return new showcaseObj();
};
module.exports = mongoose.model('showcases', showcaseSchema);