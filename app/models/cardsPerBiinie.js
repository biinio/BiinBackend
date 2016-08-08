var mongoose = require('mongoose');
var utils = require('../controllers/utils.server.controller');

module.exports = mongoose.model('cardsPerBiinie', {
    identifier: { type: String, index: true, default: utils.getGUID},
    userIdentifier: { type: String, index: true, default: ""},
    card: {type: mongoose.Schema.Types.ObjectId, ref: 'cards'},
    usedSlots:{ type: Number, default: 0},
    enrolledDate:{ type:Date, default: Date.now},
    startDate:{ type:Date, default: Date.now},
    endDate:{ type:Date, default: null},
    isCompleted:{ type: Boolean, default: false},
    isBiinieEnrolled:{ type:Boolean, default: true},
    isUnavailable:{ type:Boolean, default: false }
});
