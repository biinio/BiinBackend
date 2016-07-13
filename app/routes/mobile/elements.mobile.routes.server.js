'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    app.get('/mobile/elements/:identifier', mobile.getMobileElements);
    app.get('/mobile/biinies/:identifier/highlights', mobile.getMobileHighlightElements);
    app.get('/mobile/biinies/:biinieIdentifier/elements/:identifier', mobile.getMobileElements);

};




