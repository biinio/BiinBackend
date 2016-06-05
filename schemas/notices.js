/**
 * Created by Ivan on 5/31/16.
 */
var moongose = require('mongoose');

module.exports = moongose.model('notices',{
    identifier:{type:String, index:true, default:""},
    organizationIdentifier:{type:String,index:true, default:""},
    elementIdentifier:{type:String,index:true, default:""},
    name:{type:String, default:""},
    message:{type:String,default:""},
    onSunday:{type:String,default:"0"},
    onMonday:{type:String,default:"0"},
    onTuesday:{type:String,default:"0"},
    onWednesday:{type:String,default:"0"},
    onThursday:{type:String,default:"0"},
    onFriday:{type:String,default:"0"},
    onSaturday:{type:String,default:"0"},
    startTime:{type:String,default:"00:00"},
    endTime:{type:String,default:"23:59"},
    isDeleted:{type:Boolean,default:false},
    isReady:{type:Boolean,default:false},
    isActive:{type:Boolean,default:false}
});
