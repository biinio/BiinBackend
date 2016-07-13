/**
 * Created by Ivan on 7/13/16.
 */
'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    app.route('/api/categories').get(api.listCategories);
    app.route('/api/categories/set').get( api.setCategories);

};