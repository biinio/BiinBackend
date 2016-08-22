'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var api = require('../../controllers/api.server.controller');

    //Dashboard
    app.route('/api/dashboard/visits').get(api.getVisitsReport);
    app.route('/api/dashboard/notifications').get(api.getNotificationReport);

    //Dashboard Mobile
    app.route('/api/dashboard/mobile/totalbiined').get(api.getTotalBiinedMobile);
    app.route('/api/dashboard/mobile/newsvsreturning').get(api.getNewVsReturningMobile);
    app.route('/api/dashboard/mobile/sharedelements').get(api.getTotalSharedMobile);

    //Dashboard Locals
    app.route('/api/dashboard/local/newsvsreturning').get(api.getNewVsReturningLocal);

    app.route('/api/dashboard/loyaltycard/active').get(api.getloyaltyCardDashboard)
};
