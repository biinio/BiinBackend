//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var trackingSharesSchema = new Schema({
    userIdentifier: {type: String},//Mobile User Identifier
    elementIdentifier: {type: String},
    organizationIdentifier: {type: String, index: true},
    siteIdentifier: {type: String, index: true},
    showcaseIdentifier: {type: String},
    date: {type: Date, default: Date.now, index: true},
    action: {type: String}
});

//Methods
module.exports = mongoose.model('trackingShares', trackingSharesSchema);
