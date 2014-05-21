module.exports = function (db) {
    var express = require('express');
    var MongoStore = require('connect-mongo')(express);
    var passport = require('./auth');
    var http = require('http');
    var routes = require('./routes')();
    var path = require('path');
    var app = express();
    var favicon = require('static-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var crypto = require('crypto');
    var multipart = require('connect-multiparty');
    var multipartMiddleware = multipart();
    //Others routes
    var users = require('./routes/users')(db);
    var organizations = require('./routes/organizations')(db);
    var showcases = require('./routes/showcases')(db);
    var regions = require('./routes/regions')(db);
    var biins = require('./routes/biins')(db);
    var errors = require('./routes/errors')(db);

    // At the top of your web.js
    process.env.PWD = process.cwd()

    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'jade');
    app.use(express.static(process.env.PWD + '/public'));
    app.use(express.static(process.env.PWD+'/bower_components'));
    app.use(favicon());
    app.use(logger('dev'));
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(express.session({
        secret: 'ludusy secret',
        store: new MongoStore({
            mongoose_connection: db
        })
    }));

    //Logger
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(bodyParser.json());
    app.use(express.methodOverride());

    app.use(function (req, res, next) {
        res.set('X-Powered-By', 'Ludusy');
        next();
    });

    app.use(app.router);

    //Application routes
    app.get('/partials/:filename', routes.partials);
    app.get('/', routes.index);
    app.post('/login',passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/dashboard'
    }));
    app.get('/dashboard', routes.dashboard);    
    app.get('/login',routes.login);

    //Regions organization
    app.get('/organizations',organizations.index);

    //Showcase routes
    app.get('/showcases',showcases.index);
    app.get('/api/showcases/:identifier',showcases.get);
    app.put('/api/showcases/:showcase',showcases.set);
    app.get('/api/showcases',showcases.list);
    app.get('/api/biins/:biin/showcase',showcases.getByBiin);

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

    //Image routes
    app.post('/showcases/imageUpload',multipartMiddleware,showcases.imagePost);
    app.post('/showcases/imageCrop',multipartMiddleware,showcases.imageCrop);

    /// catch 404 and forwarding to error handler
    app.use(function(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    });

    /// error handlerslogger
    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function(err, req, res, next) {
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function(err, req, res, next) {
        res.render('error', {
            message: err.message,
            error: {}
        });
    });
    return app;
};