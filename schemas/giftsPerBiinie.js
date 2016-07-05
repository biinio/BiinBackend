var moongose = require('mongoose');

module.exports = moongose.model('giftsPerBiinie', {
    biinieIdentifier:{type:String, default:""},
    identifier: {type: String, index: true, default: ""},
    gift:{
        identifier: {type: String, index: true, default: ""},
        name: {type: String, default: ""},
        messages:{type:String, default:""},
        productToGift:{type:String,default:""},
        startDate:{type:Date,default:Date.now},
        endDate:{type:Date,default:Date.now},
        expireTime:{type:Number,default:1},
        amount:{type:Number,default:1},
        amountSpent:{type:Number,default:0},
        isAutomatic:{type:Boolean,default:false},
        availableIn:{type:[String],default:[]},
        isActive:{type:Boolean,default:false},
        isValid:{type:Boolean,default:false},
        siteAssignedTo:{type:String,default:""},
        organizationIdentifier:{type:String,default:""}
    },
    isClaimed:{type:Boolean, default: false},
    isDeleted:{type:Boolean, default: false},
    status:{type:String, default: "Sent"}
});
