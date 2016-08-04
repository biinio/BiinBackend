var mongoose = require('mongoose');

module.exports = mongoose.model('cards', {
    identifier: { type: String, index: true, default: ""},
    title: { type: String, default: ""},
    goal:{ type:String, default:""},
    rule:{ type:String, default:""},
    type:{ type:String, default:"SLOTS"},
    slots:{ type:Number, default:10},
    gift: { type: mongoose.Schema.Types.ObjectId, ref: 'gifts' },
    hasConditionsURL:{type:Boolean, default:false},
    conditionsURL:{type:String, default:""},
    conditionsText:{type:String, default:""},
    renewalAutomatic:{type:Boolean, default:false},
    waitTime:{type:Number, default:1},
    isUnlimited:{type:Boolean, default:false},
    quantity:{type:Number, default:10},
    isDeleted:{type:Boolean, default:false},
    isActive:{type:Boolean, default:false},
    organizationIdentifier:{type: String, index: true, default: ""},
    amountAssigned:{type:Number, default : 0}
});
