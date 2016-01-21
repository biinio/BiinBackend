module.exports = function(app,db, passport,multipartMiddleware){

    //Others routes
    var routes = require('../routes')();
    var dashboard = require('../routes/dashboard')();
    var accounts = require('../routes/accounts')();
    var clients = require('../routes/clients')();
    var organizations = require('../routes/organizations')();
    var showcases = require('../routes/showcases')(db);
    var sites = require('../routes/sites')();
    var regions = require('../routes/regions')(db);
    var biins = require('../routes/biins')(db);
    var errors = require('../routes/errors')(db);
    var elements = require('../routes/elements')();
    var categories = require('../routes/categories')();
    var gallery = require('../routes/gallery')();
    var blog = require('../routes/blog')();
    var mobileUser = require('../routes/mobileUser')();
    var oauthMobileAPIGrants = require('../routes/oauthMobileAPIGrants')();
    var mobileOauthManager= require('./mobileOauthManager');
    var stickers = require('../routes/stickers')();
    var mobileRoutes = require('../routes/mobileRoutes')();
    var sysGlobals = require('../routes/sysGlobals')();
    var biinBiinieObjects =require('../routes/biinBiinieObjects')();
    var venues =require('../routes/venue')();
    var mobileEndPoint = require('../routes/mobileEndPoint')();
    var roles = require('../routes/roles')();
    var ratingSites = require('../routes/ratingSites')();
    var maintenance = require('../routes/maintenance')();

    //Sys routes
    app.post('/enviroments', sysGlobals.set);

    //Application routes
    app.get('/sendEmail', routes.sendEmail);
    app.get('/login',routes.login);
    app.get('/termsAndConditions',routes.terms);
    app.get('/privacypolicy',routes.privacyPolicy);
    app.get('/support',routes.support);
    app.post('/api/singup',clients.set);
    app.get('/client/:identifier/activate',clients.activate);
    app.post('/client/:identifier/activate',clients.activate);
    app.post('/api/login',function(req, res, next) {
        passport.authenticate('clientLocal', function(err, user, info) {
            if (err) { return next(err); }
            // Redirect if it fails
            if (!user) { return res.redirect('/login'); }
            req.logIn(user, function(err) {
                if (err) { return next(err); }
                // Redirect if it succeeds
                return res.redirect('/accounts');
            });
        })(req, res, next);
    });

    //Dashboard
    app.get('/api/dashboard', dashboard.get);
    app.get('/api/dashboard/set', dashboard.set);
    app.get('/api/dashboard/comparative', dashboard.getComparativeData);
    app.get('/api/dashboard/visits', dashboard.getVisitsReport);
    app.get('/api/dashboard/notifications', dashboard.getNotificationReport);
    app.get('/api/dashboard/local/visits/newvsreturning', dashboard.getNewVisitsLocal);

    //Dashboard Mobile
    app.get('/api/dashboard/mobile/sessions', dashboard.getSessionsMobile);
    app.get('/api/dashboard/mobile/newvisits', dashboard.getNewVisitsMobile);
    app.get('/api/dashboard/mobile/totalbiined', dashboard.getTotalBiinedMobile);
    app.get('/api/dashboard/mobile/visitedelements', dashboard.getVisitedElementsMobile);
    app.get('/api/dashboard/mobile/newsvsreturning', dashboard.getNewVsReturningMobile);

    //Dashboard Locals
    app.get('/api/dashboard/local/sessions', dashboard.getSessionsLocal);
    app.get('/api/dashboard/local/newvisits', dashboard.getNewVisitsLocal);
    app.get('/api/dashboard/local/fromvisits', dashboard.getFromVisitsLocal);
    app.get('/api/dashboard/local/newsvsreturning', dashboard.getNewVsReturningLocal);

    //Acounts Routes
    app.get('/accounts',accounts.index);
    app.put('/api/accounts',accounts.set);
    app.post('/api/accounts/:organizationIdentifier/default',accounts.setDefaultOrganization);
    app.get('/api/accounts',accounts.list);

    app.post('/api/imageProfile',multipartMiddleware,accounts.uploadImageProfile);

    //Categories Routes
    app.get('/api/categories',categories.list);
    app.get('/api/categories/set', categories.set);

    //Organization Routes
    app.get('/api/organizations',organizations.list);
    app.post('/api/organizations/:identifier',organizations.set);
    app.put('/api/organizations/:accountIdentifier',organizations.create);
    app.post('/api/organizations/:identifier/image',multipartMiddleware,organizations.uploadImage);
    app.delete('/api/organizations/:identifier',organizations.markAsDeleted);
    app.post('/organizations/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/organizations/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/api/organizations/:identifier/:siteIdentifier/minor', organizations.getMinor);

    //Save selected organization
    app.put('/api/organizations/:accountIdentifier/:organizationIdentifier',organizations.saveSelectedOrganization);
    // Get selected organization
    app.get('/api/organizations/:accountIdentifier/selectedOrganization', organizations.getSelectedOrganization);

    //Showcase routes
    app.get('/api/organizations/:identifier/showcases/id',showcases.getShowcaseId);
    app.post('/api/organizations/:identifier/site/showcases',organizations.setShowcasesPerSite);

    //Showcases creation
    app.post('/api/organizations/:identifier/showcases',showcases.set);

    //Showcases Update
    app.put('/api/organizations/:identifier/showcases/:showcase',showcases.set);
    app.post('/showcases/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/showcases/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/api/showcases/:identifier',showcases.get);
    app.put('/api/showcases/:showcase',showcases.set);
    app.delete('/api/organizations/:identifier/showcases/:showcase',showcases.markAsDeleted);
    app.get('/api/organizations/:identifier/showcases',showcases.list);

    //Sites routes
    app.get('/site/mapComponent',sites.mapComponent);
    app.get('/api/organizations/:identifier/sites',sites.list);
    app.post('/api/organizations/:orgIdentifier/sites',sites.set);

    //Maintenance
    app.get('/maintenance/organizations',maintenance.getOrganizationInformation);
    app.get('/maintenance/addBiinToOrganizationModal',maintenance.addBiinToOrganizationModal);
    app.get('/maintenance/getBiinsOrganizationInformation/:orgIdentifier',maintenance.getBiinsOrganizationInformation);
    app.put('/maintenance/insertBiin',maintenance.biinPurchase);
    app.post('/maintenance/insertBiin',maintenance.biinPurchase);
    app.get('/maintenance/beaconChildren',maintenance.getBeaconChildren);

    //Biins Purchase
    app.post('/api/organizations/:orgIdentifier/sites/:siteIdentifier/biins/',sites.biinPurchase);

    //Update a Site
    app.put('/api/organizations/:orgIdentifier/sites/:siteIdentifier',sites.set);
    app.post('/api/organizations/:orgIdentifier/sites/:siteIdentifier/region',sites.addSiteToRegion);

    //Create a biin
    app.put('/api/organizations/:orgIdentifier/sites/:siteIdentifier/purchase',sites.biinPurchase);
    app.delete('/api/organizations/:orgIdentifier/sites/:siteIdentifier',sites.markAsDeleted);

    //Biins
    app.get('/api/biins',biins.list);
    app.post('/api/organizations/:identifier/sites/biins',biins.updateSiteBiins);
    app.get('/api/organizations/:identifier/biins',biins.getByOrganization);
    app.post('/api/organizations/:identifier/biins/:biinIdentifier/objects',biins.setObjects);
    app.post('/api/biins/:biinIdentifier/update',biins.updateBiin);

    //Elements
    app.post('/elements/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/elements/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/_partials/galleryWidget',elements.galleryWidget);

    //Element List
    app.get('/api/organizations/:identifier/elements',elements.list);
    //Element Creation
    app.post('/api/organizations/:identifier/elements',elements.set);
    //Element Update
    app.put('/api/organizations/:identifier/elements/:element',elements.set);
    //app.delete('/api/organizations/:identifier/elements/:element',elements.delete);
    app.delete('/api/organizations/:identifier/elements/:element',elements.markAsDeleted);


    //Regions routes
    app.get('/regions/add',regions.create);
    app.post('/regions/add',regions.createPost);
    app.get('/regions/:identifier',regions.edit);
    app.post('/regions/:identifier',regions.editPost);
    app.post('/mobile/regions/:identifier/:latitude/:longitude',regions.setCoordsToRegion);//Update the Coords of a region

    //Gallery Routes
    app.get('/api/organizations/:identifier/gallery',gallery.list);
    app.post('/api/organizations/:identifier/gallery', multipartMiddleware,gallery.upload);
    app.post('/api/organizations/:identifier/gallery/upload',gallery.uploadBase64Image);

    //Client routes
    app.get('/client',clients.create);
    app.get('/logout',clients.logout);
    app.post('/api/clients/verify', clients.verifyEmailAvailability);

    //Roles routes
    // Add permission to role
    app.post('/roles/:role/:permission/addpermission', roles.addPermissionToRole);
    app.put('/roles/:accountIdentifier/:role/setrole', roles.setUserRole);
    app.get('/roles/:role/getpermission', roles.getPermissions);

    //Stickers services
    app.get('/api/stickers',stickers.get);
    app.get('/api/stickers/create',stickers.set);

    //Binnies Routes
    app.get('/biinies',mobileUser.index);
    app.get('/api/biinies',mobileUser.get);
    app.put('/api/biinies',mobileUser.set);
    app.delete('/api/biinies/:identifier',mobileUser.delete);
    app.post('/api/biinies/:identifier/image',multipartMiddleware,mobileUser.uploadImage);

    //Mobile Binnies services
    app.get('/mobile/biinies/:firstName/:lastName/:biinName/:password/:gender/:birthdate',mobileUser.setMobileByURLParams);
    app.get('/mobile/biinies/:identifier/isactivate', mobileUser.isActivate);
    app.post('/mobile/biinies/:identifier/categories', mobileUser.setCategories);
    app.get('/mobile/biinies/auth/:user/:password', mobileUser.login);
    app.get('/mobile/biinies/:identifier',mobileUser.getProfile);
    app.put('/mobile/biinies',mobileUser.setMobile);
    app.post('/mobile/biinies/:identifier',mobileUser.updateMobile);

    //Mobile Biinies Share
    app.get('/mobile/biinies/:identifier/share',mobileUser.getShare);
    app.put('/mobile/biinies/:identifier/share',mobileUser.setShare);

    //Activation Routes
    app.get('/mobile/biinies/:identifier/isactivate',mobileUser.isActivate);
    app.get('/biinie/:identifier/activate',mobileUser.activate);
    app.post('/biinie/:identifier/activate',mobileUser.activate);

    app.get('/mobile/elements/:identifier',elements.getMobile);
    app.get('/mobile/biinies/:identifier/highlights',elements.getMobileHighligh);

    //Colections
    app.get('/mobile/biinies/:identifier/collections',mobileUser.getCollections);
    app.put('/mobile/biinies/:identifier/collections/:collectionIdentifier', mobileUser.setMobileBiinedToCollection);

    //collect
    app.put('/mobile/biinies/:identifier/collect/:collectionIdentifier', mobileUser.setMobileCollect);
    //uncollect
    app.delete('/mobile/biinies/:identifier/collect/:collectionIdentifier/element/:objIdentifier', mobileUser.deleteMobileCollectElementToCollection);
    app.delete('/mobile/biinies/:identifier/collect/:collectionIdentifier/site/:objIdentifier', mobileUser.deleteMobileCollectSiteToCollection);

    //follow
    app.put('/mobile/biinies/:identifier/follow', mobileUser.setFollow);
    app.put('/mobile/biinies/:identifier/unfollow', mobileUser.setUnfollow);
    //like
    app.put('/mobile/biinies/:identifier/like', mobileUser.setLiked);
    app.put('/mobile/biinies/:identifier/unlike', mobileUser.setUnliked);

    app.delete('/mobile/biinies/:identifier/collections/:collectionIdentifier/element/:objIdentifier', mobileUser.deleteMobileBiinedElementToCollection);
    app.delete('/mobile/biinies/:identifier/collections/:collectionIdentifier/site/:objIdentifier', mobileUser.deleteMobileBiinedSiteToCollection);

    //Biinie Loyalty
    app.get('/mobile/biinies/:identifier/organizations/:organizationIdentifier', mobileUser.getOrganizationInformation);
    app.put('/mobile/biinies/:identifier/organizations/:organizationIdentifier/loyalty/points', mobileUser.setMobileLoyaltyPoints);

    //Biin Biinie Object Relation setters
    app.put('/mobile/biinies/:biinieIdentifier/biin/:biinIdentifier/object/:objectIdentifier/biined',biinBiinieObjects.setBiined);
    app.put('/mobile/biinies/:biinieIdentifier/biin/:biinIdentifier/object/:objectIdentifier/notified',biinBiinieObjects.setNotified);

    //Biinie/ Site relation
    app.put('/mobile/biinies/:biinieIdentifier/sites/:siteIdentifier/showcase/:showcaseIdentifier/notified',mobileUser.setShowcaseNotified);

    //Stars/Rating
    app.post('/mobile/biinies/:biinieIdentifier/sites/:siteIdentifier/rating/:rating',mobileRoutes.setSiteRating);
    app.post('/mobile/biinies/:biinieIdentifier/elements/:elementIdentifier/rating/:rating',mobileRoutes.setElementRating);

    //Venues
    app.get('/api/venues/search',venues.getVenueALike);
    app.put('/api/venues/create',venues.createVenue);

    //Mobile routes

    app.get('/mobile/regions',regions.listJson);
    app.get('/mobile/:identifier/:xcord/:ycord/categories',mobileRoutes.getCategories);
    app.get('/mobile/biinies/:identifier/:latitude/:longitude/categories',sites.getMobileByCategories);

    app.get('/mobile/biinies/:biinieIdentifier/elements/:identifier',elements.getMobile);

    app.get('/mobile/biinies/:biinieIdentifier/sites/:identifier',mobileRoutes.getSite);
    app.get('/mobile/biinies/:biinieIdentifier/showcases/:identifier',showcases.getMobileShowcase);

    //Mobile History
    app.put('/mobile/biinies/:identifier/history',mobileRoutes.setHistory);
    app.get('/mobile/biinies/:identifier/history',mobileRoutes.getHistory);

    //Utils
    app.get('/sites/update/validation',sites.setSitesValid);


    app.get('/mobile/initialData/:biinieId/:latitude/:longitude',mobileEndPoint.getInitialData);
    app.get('/mobile/nextElementsInShowcaseTemp',mobileEndPoint.getNextElementInShowcase);
    app.get('/mobile/biinies/:identifier/requestElementsForShowcase/:siteIdentifier/:showcaseIdentifier/:batch',mobileEndPoint.getNextElementInShowcase);
    app.get('/mobile/biinies/:identifier/requestElementsForCategory/:idCategory/:batch',mobileEndPoint.getNextElementsInCategory);
    app.get('/mobile/biinies/:identifier/requestSites/:batch',mobileEndPoint.getNextSites);
    app.get('/mobile/biinies/:identifier/requestCollection',mobileEndPoint.getCollections);

    app.get('/mobile/v2/initialData/:biinieId/:latitude/:longitude',mobileEndPoint.getInitalDataFullCategories);

    app.put('/mobile/rating/site',ratingSites.putRating);
    app.get('/ratings/site',ratingSites.getRatings);


};
