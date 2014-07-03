module.exports = function (db) {
    var express = require('express');
    var MongoStore = require('connect-mongo')(express);
    var passport = require('./auth');
    var http = require('http');
    var path = require('path');
    var app = express();
    var favicon = require('static-favicon');
    var logger = require('morgan');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var crypto = require('crypto');
    var multipart = require('connect-multiparty');
    var multipartMiddleware = multipart();
    var lessMiddleware = require('less-middleware');

    //Define local vars
    var isDevelopment = app.get('env') === 'development';

    // At the top of your web.js
    process.env.PWD = process.cwd()


    // Less configuration
    if(isDevelopment)
        app.use(lessMiddleware(path.join(process.env.PWD , 'public')),{
            force:true,
            debug:true,
            compress:false
        });
    else
        app.use(lessMiddleware(path.join(process.env.PWD , 'public')),{
            force:false,
            debug:false,
            once:true,
            compress:true
        });


    // View engine setup
    app.set('views', path.join(process.env.PWD, 'views'));//Replace --dirname
    app.set('view engine', 'jade');


    app.use(express.static(path.join(process.env.PWD , 'public')));
    app.use(express.static(path.join(process.env.PWD,'bower_components')));
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

    //Application Routes
    app.use(app.router);
    
    //Routes
    var routes = require("./routes.js")(app,db,passport,multipartMiddleware);

    /// error handlerslogger
    // development error handler
    // will print stacktrace
    if (isDevelopment) {
        app.use(function(err, req, res, next) {
            console.log("Hellow error of development: " + err.message +" stack: "+error.stack);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }else{
        // production error handler
        // no stacktraces leaked to user
        app.use(function(err, req, res, next) {
            console.log("Hellow error of production");
            res.render('error', {
                message: err.message,
                error: {}
            });
        });
    }

    return app;
};