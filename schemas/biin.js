var moongose = require('mongoose');

module.exports = moongose.model('biins',{
			identifier:{type:String, index:true, default:""},
			name:{type:String, default:""},
			major:{type:String, default:""},
			minor:{type:String, default:""},
			proximityUUI:{type:String, default:""},
			location:{type:String, default:""},
			registerDate:{type:String, default:""},
			lastUpdate:{type:String, default:""},
			showcases:[{
                isDefault: {type:String,default:"0"},
                showcaseIdentifier:{type:String,default:""},
                startTime:{type:String,default:"00:00"},
                endTime:{type:String,default:"00:00"}
            }],
            biinType:{type:String,default:"1"},
            isRequiredBiin:{type:Boolean,default:false},
            latitude:{type:Number,default:0},
            longitude:{type:Number,default:0},
            state:{type:String,default:"Not Installed"},
            isAssigned:{type:Boolean, default:false},
            organizationIdentifier:{type:String, default:""},
            siteIdentifier:{type:String, default:""},
            accountIdentifier:{type:String, default:""},
            purchaseDate:{type:String, default:""}
	});

