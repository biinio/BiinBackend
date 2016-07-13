'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    app.route('/api/organizations/:identifier/gallery').get( api.listGallery);
    app.route('/api/organizations/:identifier/gallery').post( api.uploadGallery);
    app.route('/api/organizations/:identifier/gallery/upload').post( api.uploadBase64Image);

};