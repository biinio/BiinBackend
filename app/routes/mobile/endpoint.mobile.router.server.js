'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    app.get('/mobile/initialData/:biinieId/:latitude/:longitude', mobile.getInitalDataFullCategories);
    app.get('/mobile/nextElementsInShowcaseTemp', mobile.getNextElementInShowcase);
    app.get('/mobile/biinies/:identifier/requestElementsForShowcase/:siteIdentifier/:showcaseIdentifier/:batch', mobile.getNextElementInShowcase);
    app.get('/mobile/biinies/:identifier/requestElementsForCategory/:idCategory/:batch', mobile.getNextElementsInCategory);
    app.get('/mobile/biinies/:identifier/requestSites/:batch', mobile.getNextSites);
    app.get('/mobile/biinies/:identifier/requestCollection', mobile.getCollections);

    app.get('/mobile/v2/initialData/:biinieId/:latitude/:longitude', mobile.getInitalDataFullCategories);
};
