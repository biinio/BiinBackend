'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    app.route('/api/organizations/:identifier/biins/showcases').post( api.setShowcasesPerBiins);
    app.route('/api/biins').get( api.listBiins);
    app.route('/api/organizations/:identifier/sites/biins').post( api.updateSiteBiins);
    app.route('/api/organizations/:identifier/biins').get( api.getByOrganizationBiins);
    app.route('/api/organizations/:identifier/biins/:biinIdentifier/objects').post( api.setObjectsBiins);
    app.route('/api/biins/:biinIdentifier/update').post( api.updateBiin);

};