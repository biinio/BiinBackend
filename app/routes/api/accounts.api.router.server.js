'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var api = require('../../controllers/api.server.controller');

    app.route('/api/accounts').get(api.list);
    app.route('/api/accounts').put(api.set);
    app.route('/api/accounts/:organizationIdentifier/default').post(api.setDefaultOrganization);
    app.route('/api/imageProfile').post(api.uploadImageProfile);
};
