module.exports = function(app,db, passport,multipartMiddleware){
 
    //Others routes
    var routes = require('../routes')();
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

    //Application routes
    app.get('/sendEmail', routes.sendEmail)
    app.get('/partials/:filename', routes.partials);
    app.get('/', routes.index);
    app.get('/dashboard', routes.dashboard);    
    app.get('/login',routes.login);
    app.get('/home',routes.home);
    app.get('/singup',routes.singup);
    app.get('/preregister/:packageSlected/:accept',routes.preregister);
    app.get('/preorder/:packageSlected/:accept',routes.preorder);
    app.get('/preregister/:packageSlected',routes.preregister);
    app.get('/preorder/:packageSlected',routes.preorder);
    app.get('/termsAndConditions/:backPage',routes.terms);
    app.post('/api/singup',clients.set);    
    app.get('/client/:identifier/activate',clients.activate);
    app.post('/client/:identifier/activate',clients.activate);
    app.post('/login',passport.authenticate('clientLocal',{
        failureRedirect:'/login',
        successRedirect:'/dashboard'
    }));
    app.get('/mobileTest',routes.mobileTest);

    //Acounts Routes
    app.get('/accounts',accounts.index);    
    app.put('/api/accounts',accounts.set);
    app.post('/api/accounts/:organizationIdentifier/default',accounts.setDefaultOrganization);
    app.get('/api/accounts',accounts.list);        
    
    app.post('/api/imageProfile',multipartMiddleware,accounts.uploadImageProfile);

    //Categories Routes
    app.get('/api/categories',categories.list);    
    app.get('/api/categories/set', categories.set)

    //Organization Routes
    app.get('/organizations',organizations.index);
    app.get('/api/organizations',organizations.list);
    app.put('/api/organizations/:identifier',organizations.set);
    app.post('/api/organizations',organizations.set);
    app.post('/api/organizations/:identifier/image',multipartMiddleware,organizations.uploadImage); 

    app.delete('/api/organizations/:identifier',organizations.delete);
    app.post('/organizations/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/organizations/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/api/organizations/:identifier/:siteIdentifier/minor', organizations.getMinor);

    //Showcase routes
    app.get('/organizations/:identifier/showcases',showcases.index);
    app.get('/api/organizations/:identifier/showcases/id',showcases.getShowcaseId)
    //Showcases creation
    app.post('/api/organizations/:identifier/showcases',showcases.set);
    //Showcases Update
    app.put('/api/organizations/:identifier/showcases/:showcase',showcases.set);    
    app.post('/showcases/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/showcases/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/api/showcases/:identifier',showcases.get);
    app.put('/api/showcases/:showcase',showcases.set);
    app.delete('/api/organizations/:identifier/showcases/:showcase',showcases.delete);
    app.get('/api/organizations/:identifier/showcases',showcases.list);

    //Biins routes
    app.get('/api/organizations/:identifier/biins',biins.getByOrganization);

    //Sites routes
    app.get('/organizations/:identifier/sites',sites.index);    
    app.get('/api/organizations/:identifier/sites',sites.get);
    app.post('/api/organizations/:orgIdentifier/sites',sites.set);
    //Biins Purchase
    app.post('/api/organizations/:orgIdentifier/sites/:siteIdentifier/biins/',sites.biinPurchase);    

    //Update a Site
    app.put('/api/organizations/:orgIdentifier/sites/:siteIdentifier',sites.set);
    //Create a biin
    app.put('/api/organizations/:orgIdentifier/sites/:siteIdentifier/purchase',sites.biinPurchase);    
    app.delete('/api/organizations/:orgIdentifier/sites/:siteIdentifier',sites.delete);

    //Biins
    app.get('/api/biins',biins.list);
    app.post('/api/organizations/:identifier/sites/biins',biins.updateSiteBiins);
    
    //Elements
    app.get('/organizations/:identifier/elements', elements.index);
    app.post('/elements/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/elements/imageCrop',multipartMiddleware,showcases.imageCrop);
    //Element List
    app.get('/api/organizations/:identifier/elements',elements.list)
    //Element Creation
    app.post('/api/organizations/:identifier/elements',elements.set);
    //Element Update
    app.put('/api/organizations/:identifier/elements/:element',elements.set);
    app.delete('/api/organizations/:identifier/elements/:element',elements.delete);

    //Regions routes
    app.get('/regions',regions.index)
    app.get('/regions/add',regions.create);
    app.post('/regions/add',regions.createPost);
    app.get('/regions/:identifier',regions.edit);
    app.post('/regions/:identifier',regions.editPost);
    app.get('/api/regions',regions.listJson);
    app.get('/api/regions/:region/biins',biins.listJson);

    //Gallery Routes
    app.get('/organizations/:identifier/gallery', gallery.index);
    app.get('/api/organizations/:identifier/gallery',gallery.list);
    app.post('/api/organizations/:identifier/gallery', multipartMiddleware,gallery.upload);

    //Utilities Routes
    app.get('/errors',errors.index);
    app.post('/api/errors/add',errors.create);

    //Client routes
    app.get('/client',clients.create);
    app.get('/logout',clients.logout);

    //Stickers services
    app.get('/api/stickers',stickers.get);
    app.get('/api/stickers/create',stickers.set);

    //Binnies Routes
    app.get('/binnies',mobileUser.index);
    app.get('/api/binnies',mobileUser.get);
    app.put('/api/binnies',mobileUser.set);
    app.delete('/api/binnies/:identifier',mobileUser.delete); 
    app.post('/api/binnies/:identifier/image',multipartMiddleware,mobileUser.uploadImage); 

    //Mobile Binnies services
    app.get('/mobile/binnies/:firstName/:lastName/:biinName/:password/:gender',mobileUser.setMobileByURLParams);
    app.get('/mobile/binnies/:identifier/isactivate', mobileUser.isActivate);
    app.post('/mobile/binnies/:identifier/categories', mobileUser.setCategories);
    app.get('/mobile/binnies/auth/:user/:password', mobileUser.login);
    app.get('/mobile/binnies/:identifier',mobileUser.getProfile);    
    app.put('/mobile/binnies',mobileUser.setMobile);
    app.get('/mobile/binnies/:identifier/isactivate',mobileUser.isActivate);
    app.get('/binnie/:identifier/activate',mobileUser.activate);
    app.post('/binnie/:identifier/activate',mobileUser.activate);    

    //Mobile routes    
    /*app.put('/mobile/client/grant',oauthMobileAPIGrants.set);
    app.put('/mobile/client',passport.authenticate(['mobileClientBasic', 'mobileClientPassword']), mobileUser.set);
    app.post('/mobile/client/token', mobileOauthManager.token);
    app.get('/mobile/regions', passport.authenticate('mobileAccessToken', { session: false }),regions.listJson);*/
    
    app.get('/mobile/regions',mobileRoutes.getRegions);
    app.get('/mobile/categories',mobileRoutes.getCategories);
    app.get('/mobile/elements/:identifier',mobileRoutes.getElement);
    app.get('/mobile/sites/:identifier',mobileRoutes.getSite);
    app.get('/mobile/showcases/:identifier',mobileRoutes.getShowcase);

    

    app.get('/blog/', blog.index);
    app.get('/api/blog', blog.list);
    app.get('/public/blog/:year/:month/:day/:title', blog.entry);
    //Blog routes

    /// catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
}