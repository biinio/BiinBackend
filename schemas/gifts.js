var moongose = require('mongoose');

module.exports = moongose.model('gifts', {
    identifier: {type: String, index: true, default: ""},
    name: {type: String, default: ""},
    messages:{type:String, default:""},
    objectToGift:{type:String,default:""},
    startDate:{type:Date,default:Date.now},
    endDate:{type:Date,default:Date.now},
    expireTime:{type:Number,default:1},
    amount:{type:Number,default:1},
    isAutomatic:{type:Boolean,default:false},
    availableIn:{type:[String],default:[]},
    isActive:{type:Boolean,default:false},
    isDeleted:{type:Boolean,default:false},
    isValid:{type:Boolean,default:false},
    siteAssignedTo:{type:String,default:""},
    organizationIdentifier:{type:String,default:""}
});
