//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var trackingNotificationsSchema=new Schema({
	userIdentifier:{type:String},//Mobile User Identifier
	beaconIdentifier:{type:String},
  objectIdentifier:{type:String},
  organizationIdentifier{type:String,index:true},
  siteIdentifier:{type:String},
  date:{type : Date, default: Date.now,index:true},
  action:{type:String}
});

//Methods
module.exports = mongoose.model('trackingNotifications', trackingNotificationsSchema);
