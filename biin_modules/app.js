module.exports = function (db) {
    var express = require('express');
    var session = require('express-session')
    var MongoStore = require('connect-mongo')(session);
    var passport = require('./auth');
    var fs = require('fs');
    var http = require('http');
    var https = require('https');
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
    var methodOverride = require('method-override')

    //Define local vars
    var isDevelopment = app.get('env') === 'development';

    // At the top of your web.js
    process.env.PWD = process.cwd()

    //SSL Force Confifuration
    var forceSsl = function (req, res, next) {
        console.log("The header is: "+req.secure);
        if (!req.secure) {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        } else {
            next();
        }
    };


    // Less configuration
    if(isDevelopment){
        console.log("========***********************Is development enviroment")
        app.use(lessMiddleware(path.join(process.env.PWD , 'public'),{
            force:true,
            debug:true,
            compress:false
        }));
    }
    else
    {
        console.log("========***********************Is production enviroment")
        //Less middleware use in production
        app.use(lessMiddleware(path.join(process.env.PWD , 'public'),{
            force:false,
            debug:false,
            once:true,//Set to compile once when the application start
            compress:true
        }));

    }
    //SSL configuration
    app.enable('trust proxy');
    app.use(forceSsl);

    // View engine setup
    app.set('views', path.join(process.env.PWD, 'views'));//Replace --dirname
    app.set('view engine', 'jade');


    app.use(express.static(path.join(process.env.PWD , 'public')));
    app.use(express.static(path.join(process.env.PWD,'bower_components')));
    app.use(favicon());
    app.use(logger('dev'));
    app.use(bodyParser.urlencoded());
    app.use(cookieParser());
    app.use(session({
        secret: 'ludusy secret',
        store: new MongoStore({
            mongoose_connection: db
        })
    }));

    //Logger
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(bodyParser.json());
    app.use(methodOverride('X-HTTP-Method-Override'));

    app.use(function (req, res, next) {
        res.set('X-Powered-By', 'Ludusy');
        next();
    });
    
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

    app.use(function(req, res, next){
      // the status option, or res.statusCode = 404
      // are equivalent, however with the option we
      // get the "status" local available as well
      res.render('404', { status: 404, url: req.url });
    });

    return app;
};