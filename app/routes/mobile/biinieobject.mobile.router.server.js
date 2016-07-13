'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    app.put('/mobile/biinies/:biinieIdentifier/biin/:biinIdentifier/object/:objectIdentifier/biined', mobile.setBiined);
    app.put('/mobile/biinies/:biinieIdentifier/biin/:biinIdentifier/object/:objectIdentifier/notified', mobile.setNotified);

};
