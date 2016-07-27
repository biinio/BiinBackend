'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    app.route('/api/organizations/:identifier/cards').get( api.getCardsList);
    app.route('/api/organizations/:identifier/cards/:cardsidentifier').put( api.updateCard);
    app.route('/api/organizations/:identifier/cards').post(api.createCard);
    app.route('/api/organizations/:identifier/cards/:cardsidentifier').delete( api.deleteCard);

    // app.route('/api/organizations/:identifier/sites/:sitesidentifier/getavailablegifts/:typegift/:automatic').get( api.getGiftsAvailable );
    //
    // app.route('/api/gift/assign').post(api.assignGift);
    // app.route('/api/gift/assign/auto/nps').post(api.assignAutoGiftNPS);
    // app.route('/api/gift/cancel/auto/nps').post(api.cancelAutoGiftNPS);
    // app.route('/api/gift/assign/nps').post(api.assignGiftNPS);
    // app.route('/api/gift/deliver/nps').post(api.deliverGiftNPS);
    //
    // app.route('/api/organizations/:identifier/gifts').get( api.getUpdatedAmount);

};