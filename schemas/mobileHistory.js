//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mobileHistorySchema=new Schema({
	mobileUserIdentifier:{type:String,index:true}
	actions:[
		at:{type:String},
		did:{type:String},
		to:{type:String},
		toType:{type:String}
	]
});

//Methods
module.exports = mongoose.model('mobileHistory', mobileHistorySchema);
