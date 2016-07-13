'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    app.route('/ratings/site').get( api.getRatings);
    app.route('/ratings/organization').get( api.getRatingsByOrganization);
    app.route('/ratings/nps').get( api.getNPSRatings);


};