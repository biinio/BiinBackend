'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');
    //Maintenance
    app.route('/maintenance/organizations').get(api.getOrganizationInformation);
    app.route('/maintenance/getBiinsOrganizationInformation/:orgIdentifier').get(api.getBiinsOrganizationInformation);
    app.route('/maintenance/insertBiin').put(api.biinPurchase);
    app.route('/maintenance/insertBiin').post(api.biinPurchase);
    app.route('/maintenance/beaconChildren').get(api.getBeaconChildren);

};