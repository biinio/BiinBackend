'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    //Binnies Routes
    app.route('/biinies').get(api.indexBiinies);
    app.route('/api/biinies').get( api.getBiinies);
    app.route('/api/biinies').put( api.setBiinies);
    app.route('/api/biinies/:identifier').delete( api.deleteBiinies);
    app.route('/api/biinies/:identifier/image').post( api.uploadImageBiinies);

};