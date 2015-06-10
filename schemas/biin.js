var moongose = require('mongoose');

module.exports = moongose.model('biins',{
			identifier:{type:String, index:true, default:""},
            brandIdentifier:{type:String, default:""},
			name:{type:String, default:""},
			major:{type:String, default:""},
			minor:{type:String, default:""},
			proximityUUID:{type:String, default:""},
			venue:{type:String, default:""},//It's the area where is located the biinie (location/venue)
            position:{type:String, default:""},//It's the place where is located the biinie eg: at the entrance
			registerDate:{type:String, default:""},
			lastUpdate:{type:String, default:""},
			showcases:[{
                isDefault: {type:String,default:"0"},
                showcaseIdentifier:{type:String,default:""},
                startTime:{type:String,default:"00:00"},
                endTime:{type:String,default:"00:00"}
            }],
            objects:[{
                isDefault: {type:String,default:"0"},
                identifier:{type:String,default:""},                
                objectType:{type:String,default:"element"},
                name:{type:String,default:"element"},
                notification:{type:String,default:"element"},
                hasNotification:{type:String,default:"0"},
                hasTimeOptions:{type:String,default:"0"},
                startTime:{type:String,default:"00:00"},
                endTime:{type:String,default:"00:00"},
                onSunday:{type:String,default:"0"},
                onMonday:{type:String,default:"0"},
                onTuesday:{type:String,default:"0"},
                onWednesday:{type:String,default:"0"},
                onThursday:{type:String,default:"0"},
                onFriday:{type:String,default:"0"},
                onSaturday:{type:String,default:"0"}

            }],
            biinType:{type:String,default:"1"},
            isRequiredBiin:{type:Boolean,default:false},
            latitude:{type:Number,default:0},
            longitude:{type:Number,default:0},
            status:{type:String,default:"Not Installed"},
            isAssigned:{type:Boolean, default:false},
            organizationIdentifier:{type:String, default:""},
            siteIdentifier:{type:String, default:""},
            accountIdentifier:{type:String, default:""},
            purchaseDate:{type:String, default:""}
	});

