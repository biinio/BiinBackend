#!/usr/bin/env node

var fs = require('fs'),
    http = require('http'),
    https = require('https'),
    util = require('util'),
    chalk = require('chalk');
var mongoose = require('mongoose');

var connectionString = process.env.DB_CONNECTION;

// Bootstrap db connection
var db = mongoose.connect(connectionString, function(err) {
    if (err) {
        console.error(chalk.red('Could not connect to MongoDB!'));
        console.log(chalk.red(err));
    }
});

var debug = require('debug')('BiinBackEnd'),
    app = require('./app/app')();

//Define local vars
var isDevelopment = process.env.NODE_ENV === 'development';
var isQA = process.env.NODE_ENV === 'qa';
var isDemo = process.env.NODE_ENV === 'demo';
//var isProduction = process.env.NODE_ENV === 'production';

var httpPort = process.env.PORT || 3000;
var httpsPort = 8443;

app.set('port', httpPort);

//Https credentials
var privateKey = fs.readFileSync('sslcert/server.key', 'utf8').toString();
var certificate = fs.readFileSync('sslcert/bundle.crt', 'utf8').toString();
var credentials = {key: privateKey, cert: certificate};

//Http Server instance
http.createServer(app).listen(httpPort, function () {
    console.log(chalk.red("Listing server on port " + httpPort));
});

//Https Server instance
if (!isDevelopment && !isQA && !isDemo) {
    https.createServer(credentials, app).listen(httpsPort, function () {
        console.log("Listing https server on port " + httpsPort);
    });
}
