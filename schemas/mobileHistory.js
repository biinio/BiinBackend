//Mobile User or Binnie
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mobileHistorySchema = new Schema({
    identifier: {type: String, index: true},//Mobile User Identifier
    actions: [
        {
            whom: {type: String},
            at: {type: String},
            did: {type: String},
            to: {type: String},
            toType: {type: String}
        }

    ]
});

//Methods
module.exports = mongoose.model('mobileHistory', mobileHistorySchema);
