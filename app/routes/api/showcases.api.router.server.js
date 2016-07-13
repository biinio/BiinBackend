'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    //Showcase routes
    app.route('/api/organizations/:identifier/showcases/id').get( api.getShowcaseIdShowcase);
    //Showcases creation
    app.route('/api/organizations/:identifier/showcases').post(api.setShowcase);
    //Showcases Update
    app.route('/api/organizations/:identifier/showcases/:showcase').put(api.setShowcase);
    app.route('/showcases/imageUpload').post( api.imagePostShowcase);
    app.route('/showcases/imageCrop').post( api.imageCropShowcase);
    app.route('/organizations/imageCrop').post( api.imageCropShowcase);
    app.route('/organizations/imageUpload').post(api.imagePostShowcase);
    app.route('/api/showcases/:identifier').get(api.getShowcase);
    app.route('/api/showcases/:showcase').put(api.setShowcase);
    app.route('/api/organizations/:identifier/showcases/:showcase').delete(api.markAsDeletedShowcase);
    app.route('/api/organizations/:identifier/showcases').get(api.listShowcase);

};