var moongose = require('mongoose');

module.exports = moongose.model('sysGlobals',{
	identifier:{type:String, index:true, default:"-1"},
	mayorCount:{type:Number,default:0},
	description:{type:String,default:""}
});