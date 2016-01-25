var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var utils = require('../biin_modules/utils')();

var ratingSites = new Schema({
	identifier:{type:String, default:"-1", index:true},
  siteIdentifier:{type:String, default:"-1", index:true},
  userIdentifier:{type:String, default:"-1", index:true},
  rating:{type:Number, default:0, index:true},
  comment:{type:String, default:"", index:true},
  date:{type:Date, default:Date(), index:true},
});

module.exports = mongoose.model('ratingSites', ratingSites);
