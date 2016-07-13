'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');
    app.route('/api/notices/organizations/:identifier').get( api.getNotice);
    app.route('/api/notices/organizations/:identifier').put( api.createNotice);
    app.route('/api/notices/organizations/:identifier').post( api.updateNotice);
    app.route('/api/notices/:identifier').delete( api.deleteNotice);

};