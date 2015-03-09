var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var showcaseObj={
	identifier:{ type: String, index: true, default:"-1"},
	accountIdentifier:{type:String, default:"000"},
	organizationIdentifier:{type:String, default:""},

	showcaseType:{type:String, default:""},
	theme:{type:String,default:""},

	name:{type:String, default:""},
	description:{type:String, default:""},
	pushNotification:{type:String, default:""},
	lastUpdate:{type:String,default:""},
	titleColor:{type:String,default:"rgb(0,0,0)"},
	
	elements:[
		{
			elementIdentifier:String,
			position:{type:String, default:"1"},
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
						url:{type:String, default:""}
					}
				],
			media:[
				{
					identifier:{type:String, default:""},
					title1:{type:String, default:""},
					url:{type:String,default:""},
					mediaType:{type:String,default:""},
					mainColor:{type:String,default:""}
				}
			],
			biinedCount:{type:Number,default:0},
			sharedCount:{type:Number,default:0},
			commentedCount:{type:Number,default:0}			
		}
	],
	webAvailable:[],
	activateNotification:{type:String,default:"0"},
	notifications:[{
		isActive:{type:String, default:"0"},
		notificationType:{type:String, default:""},
		text:{type:String, default:""}
	}]
};
var showcaseSchema = new Schema(showcaseObj);
showcaseSchema.methods.createNew = function() {	
	return new showcaseObj();
};
module.exports = mongoose.model('showcases', showcaseSchema);