module.exports = function(app,db, passport,multipartMiddleware){
 
    //Others routes
    var routes = require('../routes')();
    var users = require('../routes/users')(db);
    var organizations = require('../routes/organizations')(db);
    var showcases = require('../routes/showcases')(db);
    var regions = require('../routes/regions')(db);
    var biins = require('../routes/biins')(db);
    var errors = require('../routes/errors')(db);
    var elements = require('../routes/elements')();

    //Application routes
    app.get('/partials/:filename', routes.partials);
    app.get('/', routes.index);
    app.get('/dashboard', routes.dashboard);    
    app.get('/login',routes.login);
    app.get('/home',routes.home);
    app.post('/login',passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/dashboard'
    }));

    //Regions organization
    app.get('/organizations',organizations.index);

    //Showcase routes
    app.get('/showcases',showcases.index);
    app.post('/showcases/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/showcases/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/api/showcases/:identifier',showcases.get);
    app.put('/api/showcases/:showcase',showcases.set);
    app.get('/api/showcases',showcases.list);
    app.get('/api/biins/:biin/showcase',showcases.getByBiin);
    
    //Elements
    app.post('/elements/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/elements/imageCrop',multipartMiddleware,showcases.imageCrop);
    app.get('/api/elements',elements.list)

    //Regions routes
    app.get('/regions',regions.index)
    app.get('/regions/add',regions.create);
    app.post('/regions/add',regions.createPost);
    app.get('/regions/:identifier',regions.edit);
    app.post('/regions/:identifier',regions.editPost);
    app.get('/api/regions',regions.listJson);
    app.get('/api/regions/:region/biins',biins.listJson);

    //Utilities Routes
    app.get('/errors',errors.index);
    app.post('/api/errors/add',errors.create);

    //Regions routes
    app.get('/user',users.create);

    /// catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });
}