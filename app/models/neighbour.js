var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var neighbour = {
    siteIdentifier: {type: String, default: "000", index: true},
    neighbours: {type: [String], default: []},
    geoPosition: {type: [Number], index: "2dsphere"}
};

var neighbourSchema = new Schema(neighbour);

module.exports = mongoose.model('neighbour', neighbourSchema);
