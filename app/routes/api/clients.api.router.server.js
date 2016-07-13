'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    app.route('/client').get(api.createClient);
    app.route('/logout').get(api.logoutClient);
    app.route('/api/clients/verify').post(api.verifyEmailAvailability);

};