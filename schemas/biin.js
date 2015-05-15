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
            isRequiredBiin:{type:Boolean,default:'false'}
	});

