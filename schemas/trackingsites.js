//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var trackingSitesSchema=new Schema({
	userIdentifier:{type:String},//Mobile User Identifier
  organizationIdentifier:{type:String,index:true},
  siteIdentifier:{type:String,index:true},
  date:{type : Date, default: Date.now,index:true},
  action:{type:String}
});

//Methods
module.exports = mongoose.model('trackingSites', trackingSitesSchema);
