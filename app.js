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

    //Others routes
    var users = require('./routes/users')(db);
    var organizations = require('./routes/organizations')(db);
    var showcases = require('./routes/showcases')(db);
    var regions = require('./routes/regions')(db);
    var biins = require('./routes/biins')(db);

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
    app.get('/partials/:filename', routes.partials);
    app.get('/', routes.index);
    app.get('/login',routes.login);
    app.get('/test',routes.angularTest);
    app.get('/organizations',organizations.index);
    app.get('/showcases',showcases.index);
    app.get('/showcasesList',showcases.list);
    app.get('/regions',regions.list);
    app.get('/regions/:region/biins',biins.list);
    app.post('/login',passport.authenticate('local',{
        failureRedirect:'/login',
        successRedirect:'/dashboard'
    }));
    app.get('/dashboard', routes.dashboard);
    app.get('/user',users.create);


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