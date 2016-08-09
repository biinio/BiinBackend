var moongose = require('mongoose');

module.exports = moongose.model('gifts', {
    identifier: {type: String, index: true, default: ""},
    name: {type: String, default: ""},
    message:{type:String, default:""},
    startDate:{type:Date,default:Date.now},
    endDate:{type:Date,default:Date.now},
    expireTime:{type:Number,default:1},
    amount:{type:Number,default:1},
    amountSpent:{type:Number,default:0},
    isAutomatic:{type:Boolean,default:false},
    availableIn:{type:[String],default:[]},
    isActive:{type:Boolean,default:false},
    isDeleted:{type:Boolean,default:false},
    isValid:{type:Boolean,default:false},
    isUnlimited:{type:Boolean,default:false},
    sites:{type:[String],default:[]},
    productIdentifier:{type:String,default:""},
    organizationIdentifier:{type:String,default:""},
    hasAvailablePeriod:{type:Boolean,default:false}
});
