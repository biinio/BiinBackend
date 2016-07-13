//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tempHistorySchema = new Schema({
    identifier: {type: String, index: true},//TempObject
    actions: [
        {
            whom: {type: String},
            at: {type: Date, default: Date.now},
            did: {type: String},
            to: {type: String},
            toType: {type: String}
        }

    ]
});

//Methods
module.exports = mongoose.model('tempHistory', tempHistorySchema);