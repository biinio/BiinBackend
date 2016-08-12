var moongose = require('mongoose');
var utils = require('../controllers/utils.server.controller');

module.exports = moongose.model('qrCodePerSite', {
    identifier: {type: String, index: true, default: utils.getGUID},
    siteIdentifier : {type: String, index: true, default: ""},
    isActive: {type: Boolean, default: true}
});
