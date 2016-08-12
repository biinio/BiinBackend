'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    //Sites routes
    app.route('/api/organizations/:identifier/sites').get( api.listSites);
    app.route('/api/organizations/:orgIdentifier/sites').post( api.setSites);

    //Update a Site
    app.route('/api/organizations/:orgIdentifier/sites/:siteIdentifier').put( api.setSites);

    app.route('/api/organizations/:orgIdentifier/sites/:siteIdentifier').delete( api.markAsDeletedSites);

    app.route('/api/organizations/:orgIdentifier/sites/:siteIdentifier/getqrcode').get( api.getQRCode);
    app.route('/api/organizations/:orgIdentifier/sites/:siteIdentifier/refreshqrcode').post( api.setNewSiteQRCode);

};