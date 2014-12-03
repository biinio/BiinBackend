var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var elementSchema = new Schema({

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
	}]

});

module.exports = mongoose.model('elements', elementSchema);