module.exports = function (db) {
    var express = require('express'),
        session = require('express-session'),
        mongoStore = require('connect-mongo')(session),
        fs = require('fs'),
        http = require('http'),
        https = require('https'),
        path = require('path'),
        app = express(),
        favicon = require('serve-favicon'),
        logger = require('morgan'),
        //cookieParser = require('cookie-parser'),
        bodyParser = require('body-parser'),
        crypto = require('crypto'),
        lessMiddleware = require('less-middleware'),
        cors = require('cors'),
        expressValidator = require('express-validator'),
        passport = require('passport');
    var config = require('../config/config');


    var isDevelopment = process.env.NODE_ENV === 'development';
    var isQA = process.env.NODE_ENV === 'qa';
    var isDemo = process.env.NODE_ENV === 'demo';
    //var isProduction = process.env.NODE_ENV === 'production';
    if (process.env.DONT_TRACK != 'YES') {
        var rollbar = require("rollbar");
        rollbar.init("bccc96a9f2794cdd835f2cf9f498a381");

        app.use(rollbar.errorHandler('bccc96a9f2794cdd835f2cf9f498a381'));

        var options = {
            // Call process.exit(1) when an uncaught exception occurs but after reporting all
            // pending errors to Rollbar.
            //
            // Default: false
            exitOnUncaughtException: false
        };
        rollbar.handleUncaughtExceptions("bccc96a9f2794cdd835f2cf9f498a381", options);
    }

    var compress = require('compression');
    app.use(compress());

    app.use(cors());

    // At the top of your web.js
    process.env.PWD = process.cwd();

    //SSL Force Confifuration
    var forceSsl = function (req, res, next) {
        if (!req.secure) {
            return res.redirect(['https://', req.get('Host'), req.url].join(''));
        } else {
            next();
        }
    };

    // Less configuration
    if (isDevelopment || isQA || isDemo) {
        app.use(lessMiddleware(path.join(process.env.PWD, 'public'), {
            force: true,
            debug: true,
            compress: false
        }));
    }
    else {
        //Less middleware use in production
        app.use(lessMiddleware(path.join(process.env.PWD, 'public'), {
            force: false,
            debug: false,
            once: true,//Set to compile once when the application start
            compress: true
        }));

        //SSL configuration
        app.enable('trust proxy');
        app.use(forceSsl);
    }


    // View engine setup
    app.set('views', path.join(process.env.PWD, 'views'));//Replace --dirname
    app.set('view engine', 'jade');

    app.use(express.static(path.join(process.env.PWD, 'public')));
    app.use(express.static(path.join(process.env.PWD, 'bower_components')));
    app.use(favicon(__dirname + '/../public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    //app.use(cookieParser());
    app.use(session({
        secret: 'ludusy secret',
        store: new mongoStore({
            mongooseConnection: db.connection
        }),
    }));

    //Logger
    var passport = require('../app/controllers/auth.server.controller');

    app.use(passport.initialize());
    app.use(passport.session());
    app.use(expressValidator());//Express Validator
    app.use(bodyParser.json());

    //Routes
    console.log("routing.....");
    // Globbing routing files
    config.getGlobbedFiles('./app/routes/**/*.js').forEach(function (routePath) {
        console.log(routePath);
        require(path.resolve(routePath))(app);
    });

    return app;
};
