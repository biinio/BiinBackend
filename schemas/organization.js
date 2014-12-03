var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require('../biin_modules/utils')();

//Define the validations for an organization
var validations={
	required :['accountIdentifier','name','brand','description']
};

var orgSchema = new Schema({
	identifier:{type:String, default:"-1", index:true},
	accountIdentifier:{type:String, default:"000"},
	name: {type:String, default:""},
	brand: {type:String, default:""},
	description: {type:String, default:""},
	extraInfo:{type:String, default:""},
	majorCounter:{type: Number, default:0},		
	//Count off biins purchased
	purchasedBiinsHist:[{
				date:{type:String,default:""},
				quantity:{type:Number,default:0},
				site:{type:String,default:""}					
			}],
	media:[
		{
			title1:{type:String, default:""},
			title1:{type:String, default:""},
			imgUrl:{type:String,default:""}
		}
	],		
	sites:[{
			identifier:{type:String, default:"-1", index:true},
			accountIdentifier:{type:String, default:"000"},
			organizationIdentifier:{type:String,default:""},
			name: {type:String, default:""},
			title1:{type:String, default:""},		
			title2:{type:String, default:""},	
			mainColor:{type:String,default:""},
			textColor:{type:String,default:""},
			title3:{type:String, default:""},	
			description: {type:String, default:""},
			major:{type: Number, default:0},
			minorCounter:{type: Number, default:0},
			country:{type:String, default:""},
			state:{type:String, default:""},
			city:{type:String, default:""},
			zipCode:{type:String, default:""},
			streetAddres:{type:String, default:""},
			phoneNumber:{type:String, default:""},
			lat:{type:String,default:0},
			lng:{type:String,default:0},
			searchTags:[],
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
					identifier:{type:String, default:""},
					title1:{type:String, default:""},
					imgUrl:{type:String,default:""}
				}
			],
			biins:[
				{
					identifier:{type:String, index:true, Default:""},
					name:{type:String, Default:""},
					major:{type:String, Default:""},
					minor:{type:String, Default:""},
					proximityUUID:{type:String, Default:""},
					location:{type:String, Default:""},
					registerDate:{type:String, Default:""},
					showcaseAsigned:{type:String, Default:""}
				}
			]
	}],
	elements:[{
	    objectIdentifier:{type:String, default:"-1", index:true},
	    organizationIdentifier:{type:String,default:""},
	    accountIdentifier:{type:String,default:""},    
	    position:{type:String, default:""},
		objectType:{type:String, default:""},

	    title:{type:String, default:""},   
	    description:{type:String, default:""},
	    longDescription:{type:String, default:""},
	    searchTags:[],    
	    sticker:{identifier:{type:String, default:""}, color:{type:String,default:""}},

	    titleColor:{type:String, default:""},
	    socialButtonsColor:{type:String, default:""},
	    
		actionType:{type:String, default:""},
		listPriceEnable:{type:Boolean, default:0},	
		listPrice:{type:String, default:""},
		price:{type:String, default:""},
		discountEnable:{type:Boolean, default:0},
		discount:{type:String, default:""},
		savings:{type:String, default:""},	

		limitedTimeEnabled:{type:Boolean,default:0},
		initialDate:{type:Date,default:""},
		expirationDate:{type:Date,default:""},

		quantityEnabled:{type:Boolean,default:0},
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
			imgUrl:{type:String,default:""}
		}],
	}],
	gallery:[{
				identifier:{type:String, index:true, default:"-1"},
				accountIdentifier:{type:String,default:""},
				originalName:{type:String, default:""},
				localUrl:{type:String, default:""},
				serverUrl:{type:String, default:""},
				dateUploaded:{type:String, default:""},
				url:{type:String,default:""}
			}]
});


orgSchema.methods.validations = function() {
	return validations;
};

module.exports = mongoose.model('organizations', orgSchema);