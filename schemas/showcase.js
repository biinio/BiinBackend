var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var showcaseObj={
	identifier:{ type: String, index: true, default:"-1"},
	accountIdentifier:{type:String, default:"000"},
	organizationIdentifier:{type:String, default:""},

	showcaseType:{type:String, default:"1"},

	name:{type:String, default:""},
	description:{type:String, default:""},
	pushNotification:{type:String, default:""},
	lastUpdate:{type:String,default:""},
	titleColor:{type:String,default:"rgb(0,0,0)"},
	
	elements:[{

	    elementIdentifier:{type:String, default:"-1", index:true},
	    organizationIdentifier:{type:String,default:""},
	    accountIdentifier:{type:String,default:""},    
	    position:{type:String, default:"1"},
		elementType:{type:String, default:""},

	    title:{type:String, default:""}, 
	    subTitle:{type:String, default:""}, 

	    nutshellDescriptionTitle:{type:String, default:""},
	    nutshellDescription:{type:String, default:""},
	    searchTags:[],    
	    sticker:{identifier:{type:String, default:""}, color:{type:String,default:""}},

	    textColor:{type:String, default:""},
	    domainColor:{type:String, default:""},
	    
		actionType:{type:String, default:""},
		currencyType:{type:String, default:"0"},
		hasListPrice:{type:String, default:"0"},	
		listPrice:{type:String, default:""},
		price:{type:String, default:""},
		
		hasDiscount:{type:String, default:"0"},
		discount:{type:String, default:""},
		savings:{type:String, default:""},	

		hasTimming:{type:String,default:"0"},
		initialDate:{type:Date,default:""},
		expirationDate:{type:Date,default:""},

		hasQuantity:{type:String,default:"0"},
		quantity:{type:String,default:""},

		details:[{
				elementDetailType:{type:String, default:""},
				text:{type:String,default:""},
				body:[{
					line:{type:String,default:""}
				}]
			}],
		activateNotification:{type:String,default:"0"},
		notifications:[{
			isActive:{type:String, default:"0"},
			notificationType:{type:String, default:""},
			text:{type:String, default:""}
		}],
		media:[{
			identifier:{type:String, default:""},
			title1:{type:String, default:""},
			url:{type:String,default:""},
			mediaType:{type:String,default:""},
			mainColor:{type:String,default:""}
		}],
		categories:[
			{
				identifier:{type:String, index:true, default:"-1"},
				name:{type:String, default:""},
				displayName:{type:String, default:""},
				imgUrl:{type:String, default:""}
			}
		],
		documentIdentifier:{type:String,index:"true"},
		biinedCount:{type:Number,default:0},
		sharedCount:{type:Number,default:0},
		commentedCount:{type:Number,default:0}		

	}],
	webAvailable:[],
	activateNotification:{type:String,default:"0"},
	notifications:[{
		isActive:{type:String, default:"0"},
		notificationType:{type:String, default:""},
		text:{type:String, default:""}
	}],
	startTime:{type:String, default:"000000"},
	endTime:{type:String, default:"000000"}
};
var showcaseSchema = new Schema(showcaseObj);
showcaseSchema.methods.createNew = function() {	
	return new showcaseObj();
};
module.exports = mongoose.model('showcases', showcaseSchema);