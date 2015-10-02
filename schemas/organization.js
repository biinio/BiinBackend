var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require('../biin_modules/utils')();
var element = require('./element')();

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
	loyaltyEnabled:{type:String, default:"0"},
	majorCounter:{type: Number, default:1},
	biinsCounter:{type:Number,default:0},
	biinsAssignedCounter:{type:Number,default:0},		
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
			url:{type:String,default:""},
			mainColor:{type:String,default:""},
			vibrantColor:{type:String,default:""},
			vibrantDarkColor:{type:String,default:""},
			vibrantLightColor:{type:String,default:""}
		}
	],		
	sites:[{
		identifier:{type:String, default:"-1", index:true},
		accountIdentifier:{type:String, default:"000"},
		organizationIdentifier:{type:String,default:""},
		proximityUUID:{type:String,default:""},	
		title1:{type:String, default:""},	
		title2:{type:String, default:""},	
		mainColor:{type:String,default:""},
		textColor:{type:String,default:""},
		description: {type:String, default:""},
		nutshell:{type:String, default:""},
		major:{type: Number, default:0},
		minorCounter:{type: Number, default:1},
		country:{type:String, default:""},
		state:{type:String, default:""},
		city:{type:String, default:""},
		zipCode:{type:String, default:""},
		streetAddres:{type:String, default:""},
		phoneNumber:{type:String, default:"1-800-888-8888"},
		ubication:{type:String, default:""},
		email:{type:String, default:"email@email.com"},		
		lat:{type:String,default:0},
		lng:{type:String,default:0},
		searchTags:[],
		categories:[
			{
				identifier:{type:String, index:true, default:"-1"},
				name:{t1ype:String, default:""},
				displayName:{type:String, default:""},
				url:{type:String, default:""}
			}
		],
		media:[
			{
				identifier:{type:String, default:""},
				title1:{type:String, default:""},
				url:{type:String,default:""},
				mainColor:{type:String,default:""},
				vibrantColor:{type:String,default:""},
				vibrantDarkColor:{type:String,default:""},
				vibrantLightColor:{type:String,default:""}
			}
		],
		showcases:[
			{
	            showcaseIdentifier:{type:String,default:""}
	        }
	    ],
		biins:[
			{
				identifier:{type:String, index:true, default:""},
				name:{type:String, default:""},
				major:{type:String, default:""},
				minor:{type:String, default:""},
				proximityUUID:{type:String, default:""},
				venue:{type:String, default:""},
				position:{type:String, default:""},//It's the place where is located the biinie eg: at the entrance
				children:[],
				registerDate:{type:String, default:""},
				lastUpdate:{type:String, default:""},
	            biinType:{type:String,default:"1"},
	            isRequiredBiin:{type:Boolean,default:'false'},
	            latitude:{type:Number,default:0},
            	longitude:{type:Number,default:0},
            	status:{type:String,default:"Not Installed"}
			}
		],
		loyalty: {
	       isSubscribed:{type:String, default:"0"},
	       subscriptionDate:{type:String, default:"2014-01-01 12:00:00"},
	       points:{type:String, default:"0"},
	       level:{type:String,default:"0"},
	       achievements: [
	           {
	               achievementIdentifier:{type:String, default:"0"}
	           }
	       ],
	       badges: [
	           {
	               badgeIdentifier:{type:String, default:"0"}
	           }
	       ]
		},
		biinedCount:{type:Number,default:0},
		collectCount:{type:Number,default:0},
		sharedCount:{type:Number,default:0},
		commentedCount:{type:Number,default:0},
		biinedUsers:[{biinieIdentifier:String}],
		userShared:[{biinieIdentifier:String,sharedTo:String}],
		userFollowed:[{biinieIdentifier:String}],
   		userCollected:[{biinieIdentifier:String}],
   		userLiked:[{biinieIdentifier:String}],
		userComments:[{position:Number, biinieIdentifier:String,comment:String,date:String}],	
		isValid:{type:Boolean,default:false},
		isDeleted:{type:Boolean,default:false},
		region:{type:String,default:""},
		rating:[
			{
				biinieIdentifier : {type:String, default:""},
				rating : {type:Number, default :0}
			}
		]		
	}],
	elements:[
		{
		    elementIdentifier:{type:String, default:"-1", index:true},
		    organizationIdentifier:{type:String,default:""},
		    accountIdentifier:{type:String,default:""},    
		    position:{type:String, default:"1"},
			elementType:{type:String, default:""},

		    title:{type:String, default:""}, 
		    subTitle:{type:String, default:""}, 

		    searchTags:[],    
		    sticker:{identifier:{type:String, default:""}, color:{type:String,default:""}},

		    textColor:{type:String, default:""},
		    domainColor:{type:String, default:""},
		    
			actionType:{type:String, default:""},
			currencyType:{type:String, default:"0"},

			hasFromPrice:{type:String, default:"0"},
			//fromPrice:{type:String, default:""},
			hasListPrice:{type:String, default:'0'},	
			listPrice:{type:String, default:""},
			hasPrice:{type:String, default:"0"},
			price:{type:Number, default:0},
			
			//Is highlight element
			isHighlight:{type:String, default:'0'},

			hasDiscount:{type:String, default:'0'},
			discount:{type:String, default:""},
			hasSaving:{type:String, default:'0'},
			savings:{type:String, default:""},	

			hasTimming:{type:String,default:"0"},
			initialDate:{type:Date,default:""},
			expirationDate:{type:Date,default:""},

			hasQuantity:{type:Boolean,default:0},
			quantity:{type:String,default:""},

			details:[{
					elementDetailType:{type:String, default:""},
					text:{type:String,default:""},
					body:[{				
						line:{type:String,default:""},
						description:{type:String,default:""},//Use for type 6
						currencyType:{type:String,default:""}//Use for type  6
					}]
				}],	
			categories:[
				{
					identifier:{type:String, index:true, default:"-1"},
					name:{type:String, default:""},
					displayName:{type:String, default:""},
					url:{type:String, default:""}
				}
			],
			media:[{
				identifier:{type:String, default:""},
				title1:{type:String, default:""},
				url:{type:String,default:""},
				mediaType:{type:String,default:""},
				mainColor:{type:String,default:""},
				vibrantColor:{type:String,default:""},
			    vibrantDarkColor:{type:String,default:""},
				vibrantLightColor:{type:String,default:""}
			}],
			biinedCount:{type:Number,default:0},
			collectCount:{type:Number,default:0},
			sharedCount:{type:Number,default:0},
			commentedCount:{type:Number,default:0},
			rating:[
				{
					biinieIdentifier : {type:String, default:""},
					rating : {type:Number, default: 0}
				}
			]
		}
	],
	gallery:[{
				identifier:{type:String, index:true, default:"-1"},
				accountIdentifier:{type:String,default:""},
				originalName:{type:String, default:""},
				localUrl:{type:String, default:""},
				serverUrl:{type:String, default:""},
				dateUploaded:{type:String, default:""},
				url:{type:String,default:""},
				mainColor:{type:String,default:""},
				vibrantColor:{type:String,default:""},
				vibrantDarkColor:{type:String,default:""},
				vibrantLightColor:{type:String,default:""}
			}]
});


orgSchema.methods.validations = function() {
	return validations;
};

module.exports = mongoose.model('organizations', orgSchema);