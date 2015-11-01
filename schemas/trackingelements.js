//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var trackingElementsSchema=new Schema({
	userIdentifier:{type:String},//Mobile User Identifier
  elementIdentifier:{type:String,index:true},
  organizationIdentifier:{type:String,index:true},
  date:{type : Date, default: Date.now,index:true},
  action:{type:String}
});

//Methods
module.exports = mongoose.model('trackingElements', trackingElementsSchema);
