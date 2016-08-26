'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    app.route('/logout').get(api.logoutClient);
    app.route('/api/clients/verify').post(api.verifyEmailAvailability);

    app.post('/api/loginCMS', api.loginCMS);


    app.route('/api/clients/invite').post(api.inviteNewClient);
    app.route('/api/clients/organization/:idorganization').get(api.getClientsByOrganization);


    app.route('/api/clients/upgrade/organization').get(api.upgradeOrganizationManagement);

};