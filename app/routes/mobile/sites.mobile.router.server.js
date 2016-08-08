'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    app.post('/mobile/biinies/:biinieIdentifier/onentersite/:siteIdentifier', mobile.onEnterSite);
    app.post('/mobile/biinies/:biinieIdentifier/onexitsite/:siteIdentifier', mobile.onExitSite);

};
