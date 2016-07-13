


'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    app.post('/mobile/biinies/:identifier/gifts/share', mobile.shareGift);
    app.post('/mobile/biinies/:identifier/gifts/claim', mobile.claimGift);
    app.post('/mobile/biinies/:identifier/gifts/refuse', mobile.refuseGift);
    app.post('/mobile/biinies/:identifier/gifts/deliver', mobile.deliverGift);

};
