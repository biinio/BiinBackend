'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    app.get('/mobile/biinies/:identifier/cards/enroll/:cardidentifier',mobile.cardEnroll);
    app.get('/mobile/biinies/:identifier/cards/setStar/:cardidentifier/biin/:siteIdentifier/:qrcodeidentifier',mobile.cardSetStar);
    app.get('/mobile/biinies/:identifier/cards/setCompleted/:cardidentifier',mobile.cardSetComplete);

};