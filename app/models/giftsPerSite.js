/**
 * Created by Ivan on 7/14/16.
 */
var mongoose = require('mongoose');

module.exports = mongoose.model('giftsPerSite', {
    identifier: {type: String, index: true, default: ""},
    siteIdentifier: {type: String, index: true, default: ""},
    gift: { type: mongoose.Schema.Types.ObjectId, ref: 'gifts' },
    date:{type:Date,default:Date.now},
    status:{type:String, default: "ACTIVE"}
});


