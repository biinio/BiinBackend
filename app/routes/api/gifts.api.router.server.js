'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    app.route('/api/organizations/:identifier/gifts').get( api.getGiftsList);
    app.route('/api/organizations/:identifier/gifts/:giftidentifier').put( api.updateGift);
    app.route('/api/organizations/:identifier/gifts').post(api.createGift);
    app.route('/api/organizations/:identifier/gifts/:giftidentifier').delete( api.removeGift);

    app.route('/api/gift/assign').post(api.assignGift);

};