'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');
    app.route('/elements/imageUpload').post( api.imagePostElements);

    //Element List
    app.route('/api/organizations/:identifier/elements').get( api.listElements);
    app.route('/api/organizations/:identifier/readyElements').get( api.listReadyElements);
    //Element Creation
    app.route('/api/organizations/:identifier/elements').post( api.setElements);
    //Element Update
    app.route('/api/organizations/:identifier/elements/:element').put( api.setElements);
    //app.delete('/api/organizations/:identifier/elements/:element').get(elements.delete);
    app.route('/api/organizations/:identifier/elements/:element').delete( api.markAsDeletedElements);

};