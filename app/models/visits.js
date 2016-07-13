var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var visitsSchema = new Schema({
    user: {type: String, default: ""},
    organizationId: {type: String},
    siteId: {type: String},
    biinId: {type: String},
    date: {type: Date, default: Date.now}
})

module.exports = mongoose.model('visits', visitsSchema);