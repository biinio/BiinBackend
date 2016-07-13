/**
 * Created by Ivan on 7/12/16.
 */
'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    //Stars/Rating
    app.post('/mobile/biinies/:biinieIdentifier/sites/:siteIdentifier/rating/:rating', mobile.setSiteRating);
    app.post('/mobile/biinies/:biinieIdentifier/elements/:elementIdentifier/rating/:rating', mobile.setElementRating);


    //Mobile routes
    app.get('/mobile/:identifier/:xcord/:ycord/categories', mobile.getCategories);

    app.get('/mobile/biinies/:biinieIdentifier/sites/:identifier', mobile.getSite);

    //Mobile History
    app.put('/mobile/biinies/:identifier/history', mobile.setHistory);
    app.get('/mobile/biinies/:identifier/history', mobile.getHistory);

    app.get('/checkversion/:version/:platform/:target', mobile.checkVersion);
    app.put('/mobile/biinies/:identifier/registerfornotifications', mobile.registerForNotifications);

};
