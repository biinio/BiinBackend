/**
 * Created by Ivan on 7/14/16.
 */
var moongose = require('mongoose');

module.exports = moongose.model('giftsPerSite', {
    identifier: {type: String, index: true, default: ""},
    gift:{ type: mongoose.Schema.Types.ObjectId, ref: 'gifts'},
    date:{type:Date,default:Date.now},
    status:{type:String, default: "Assigned"}
});
