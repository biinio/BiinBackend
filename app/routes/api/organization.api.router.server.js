'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var api = require('../../controllers/api.server.controller');

    //Organization Routes
    app.route('/api/organizations').get(api.listOrganizations);
    app.route('/api/organizations/:identifier').post(api.setOrganization);
    app.route('/api/organizations/:accountIdentifier').put(api.createOrganization);
    app.route('/api/organizations/:identifier/image').post(api.uploadImage);
    app.route('/api/organizations/:identifier').delete(api.markAsDeleted);
    app.route('/api/organizations/:identifier/:siteIdentifier/minor').get(api.getMinor);
    app.route('/api/organizations/:identifier/checkImage/:imageIdentifier').get(api.checkImageUse);
    app.route('/api/organizations/:accountIdentifier/:organizationIdentifier').put(api.saveSelectedOrganization);
    app.route('/api/organizations/:accountIdentifier/selectedOrganization').get(api.getSelectedOrganization);
    app.route('/api/organizations/:identifier/site/showcases').post(api.setShowcasesPerSite);
};