module.exports = function (db) {
    var express = require('express')
    , session = require('express-session')
    , MongoStore = require('connect-mongo')(session)
    , passport = require('./auth')
    , fs = require('fs')
    , http = require('http')
    , https = require('https')
    , path = require('path')
    , app = express()
    , favicon = require('serve-favicon')
    , logger = require('morgan')
    , cookieParser = require('cookie-parser')
    , bodyParser = require('body-parser')
    , crypto = require('crypto')
    , multipart = require('connect-multiparty')
    , multipartMiddleware = multipart()
    , lessMiddleware = require('less-middleware')
    , methodOverride = require('method-override')
    , cors = require('cors')
    , expressValidator = require('express-validator');


    var isDevelopment = process.env.NODE_ENV === 'development';
    if(process.env.DONT_TRACK != 'YES'){
    var rollbar = require("rollbar");
        rollbar.init("bccc96a9f2794cdd835f2cf9f498a381");

        app.use(rollbar.errorHandler('bccc96a9f2794cdd835f2cf9f498a381'));

        var options = {
            // Call process.exit(1) when an uncaught exception occurs but after reporting all
            // pending errors to Rollbar.
            //
            // Default: false
            exitOnUncaughtException: true
        };
        rollbar.handleUncaughtExceptions("bccc96a9f2794cdd835f2cf9f498a381", options);
    }

    var compress = require('compression');
    app.use(compress());


    schemasValidations = {};


    app.use(cors())

    app.use(function(req, res, next) {
        res.setHeader("code-version", "1.0.10");
        return next();
    });

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
    if(isDevelopment){
        app.use(lessMiddleware(path.join(process.env.PWD , 'public'),{
            force:true,
            debug:true,
            compress:false
        }));
    }
    else
    {
        //Less middleware use in production
        app.use(lessMiddleware(path.join(process.env.PWD , 'public'),{
            force:false,
            debug:false,
            once:true,//Set to compile once when the application start
            compress:true
        }));

        //SSL configuration
        app.enable('trust proxy');
        app.use(forceSsl);
    }


    // View engine setup
    app.set('views', path.join(process.env.PWD, 'views'));//Replace --dirname
    app.set('view engine', 'jade');

    app.use(express.static(path.join(process.env.PWD , 'public')));
    app.use(express.static(path.join(process.env.PWD,'bower_components')));
    app.use(favicon(__dirname + '/../public/favicon.ico'));
    app.use(logger('dev'));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
    app.use(cookieParser());
    app.use(session({
        secret: 'ludusy secret',
        store: new MongoStore({
            mongooseConnection: db
        }),
        resave: true,
        saveUninitialized: true
    }));

    //Logger
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(expressValidator());//Express Validator
    app.use(bodyParser.json());

    //Routes
    var routes = require("./routes.js")(app,db,passport,multipartMiddleware);
    return app;
};
