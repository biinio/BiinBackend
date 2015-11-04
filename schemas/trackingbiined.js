//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var trackingBiinedSchema=new Schema({
	userIdentifier:{type:String},//Mobile User Identifier
  elementIdentifier:{type:String},
  organizationIdentifier:{type:String,index:true},
  siteIdentifier:{type:String},
	showcaseIdentifier:{type:String},
  date:{type : Date, default: Date.now,index:true},
  action:{type:String}
});

//Methods
module.exports = mongoose.model('trackingBiined', trackingBiinedSchema);
