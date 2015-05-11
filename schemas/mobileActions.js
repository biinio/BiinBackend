var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var mobileActionsSchema = new Schema({
	account:{type:String, default:""},
	organization:{type:String},
	site:{type:String},
	showcase:{type:String},
	biin:{type:String},
	element:{type:String},
	actionType:{type:String},
	date:{type:String},
	mobileUser:{type:String},
	sessionType:{type:String}//'local' Local in site, 'biin' Biin Session
})

module.exports = mongoose.model('mobileActions',mobileActionsSchema);