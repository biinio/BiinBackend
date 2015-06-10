var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var validations={
	required :['title1','title2','country','state','city','zipCode','streetAddres','phoneNumber','lat','lng','categories','media']
};


var siteObj ={
	identifier:{type:String, default:"-1", index:true},
	accountIdentifier:{type:String, default:"000"},
	organizationIdentifier:{type:String,default:""},
	proximityUUID:{type:String,default:""},
	title1:{type:String, default:""},	
	title2:{type:String, default:""},	
	mainColor:{type:String,default:""},
	textColor:{type:String,default:""},
	description: {type:String, default:""},
	major:{type: Number, default:0},
	minorCounter:{type: Number, default:0},
	country:{type:String, default:""},
	state:{type:String, default:""},
	city:{type:String, default:""},
	zipCode:{type:String, default:""},
	streetAddres:{type:String, default:""},
	streetAddres2:{type:String, default:""},
	phoneNumber:{type:String, default:"1-800-888-8888"},
	ubication:{type:String, default:""},
	email:{type:String, default:"email@email.com"},
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
			imgUrl:{type:String,default:""},
			mainColor:{type:String,default:""}
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
			registerDate:{type:String, default:""},
			lastUpdate:{type:String, default:""},
			showcases:[{
                isDefault: {type:String,default:"0"},
                showcaseIdentifier:{type:String,default:""},
                startTime:{type:String,default:"00:00"},
                endTime:{type:String,default:"00:00"}
            }],
            biinType:{type:String,default:"1"},
            isRequiredBiin:{type:Boolean,default:'false'},
            latitude:{type:Number,default:0},
            longitude:{type:Number,default:0},
            status:{type:String,default:"Not Installed"}

		}
	],
	assignedBiins:[
		{identifier:{type:String}}
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
	sharedCount:{type:Number,default:0},
	commentedCount:{type:Number,default:0},
	biinedUsers:[{biinieIdentifier:String}],
	userShared:[{biinieIdentifier:String,sharedTo:String}],
	usercomments:[{position:Number, biinieIdentifier:String,comment:String,date:String}],
	isValid:{type:Boolean,default:false},
	isDeleted:{type:Boolean,default:false},
	region:{type:String,default:""}
}
var siteSchema = new Schema(siteObj);

siteSchema.methods.validations = function() {
	return validations;
};

module.exports = mongoose.model('sites', siteSchema);