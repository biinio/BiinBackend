'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var mobile = require('../../controllers/mobile.server.controller');

    app.get('/mobile/biinies/:firstName/:lastName/:biinName/:password/:gender/:birthdate', mobile.setMobileByURLParams);
    app.get('/mobile/biinies/:identifier/isactivate', mobile.isActivate);
    app.post('/mobile/biinies/:identifier/categories', mobile.setCategories);
    //app.get('/mobile/biinies/auth/:user/:password', mobile.login);
    app.get('/mobile/biinies/:identifier', mobile.getProfile);
    app.put('/mobile/biinies', mobile.setMobile);
    app.post('/mobile/biinies/:identifier', mobile.updateMobile);
    app.post('/mobile/biinies', mobile.updateMobile);

    //Facebook Login
    //app.get('/mobile/biinies/auth/thirdparty/facebook/:user', mobile.loginFacebook);
    app.get('/mobile/biinies/facebook/:firstName/:lastName/:biinName/:password/:gender/:birthdate/:facebookId', mobile.setMobileByURLParamsFacebook);

    //Mobile Biinies Share
    app.get('/mobile/biinies/:identifier/share', mobile.getShare);
    app.put('/mobile/biinies/:identifier/share', mobile.setShare);

    //Activation Routes
    app.get('/mobile/biinies/:identifier/isactivate', mobile.isActivate);
    app.get('/biinie/:identifier/activate', mobile.activate);
    app.post('/biinie/:identifier/activate', mobile.activate);


    app.get('/mobile/biinies/:identifier/collections', mobile.getCollections);
    app.put('/mobile/biinies/:identifier/collections/:collectionIdentifier', mobile.setMobileBiinedToCollection);

    //collect
    app.put('/mobile/biinies/:identifier/collect/:collectionIdentifier', mobile.setMobileCollect);
    //uncollect
    app.delete('/mobile/biinies/:identifier/collect/:collectionIdentifier/element/:objIdentifier', mobile.deleteMobileCollectElementToCollection);
    app.delete('/mobile/biinies/:identifier/collect/:collectionIdentifier/site/:objIdentifier', mobile.deleteMobileCollectSiteToCollection);

    //follow
    app.put('/mobile/biinies/:identifier/follow', mobile.setFollow);
    app.put('/mobile/biinies/:identifier/unfollow', mobile.setUnfollow);
    //like
    app.put('/mobile/biinies/:identifier/like', mobile.setLiked);
    app.put('/mobile/biinies/:identifier/unlike', mobile.setUnliked);

    app.delete('/mobile/biinies/:identifier/collections/:collectionIdentifier/element/:objIdentifier', mobile.deleteMobileBiinedElementToCollection);
    app.delete('/mobile/biinies/:identifier/collections/:collectionIdentifier/site/:objIdentifier', mobile.deleteMobileBiinedSiteToCollection);

    //Biinie Loyalty
    app.get('/mobile/biinies/:identifier/organizations/:organizationIdentifier', mobile.getOrganizationInformation);
    app.put('/mobile/biinies/:identifier/organizations/:organizationIdentifier/loyalty/points', mobile.setMobileLoyaltyPoints);
    app.put('/mobile/biinies/:biinieIdentifier/sites/:siteIdentifier/showcase/:showcaseIdentifier/notified', mobile.setShowcaseNotified);
};
