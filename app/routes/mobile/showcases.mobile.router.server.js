'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    app.get('/mobile/biinies/:biinieIdentifier/showcases/:identifier', mobile.getMobileShowcase);

};
