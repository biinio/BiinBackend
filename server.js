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

var debug = require('debug')('BinnCMS'),
    app = require('./biin_modules/app')(db);

//Define local vars
var isDevelopment = process.env.NODE_ENV === 'development';
var isQA = process.env.NODE_ENV === 'qa';
var isDemo = process.env.NODE_ENV === 'demo';
//var isProduction = process.env.NODE_ENV === 'production';

var httpPort = process.env.PORT || 3000;
var httpsPort = 8443;

app.set('port', httpPort);

//Https credentials
var privateKey = fs.readFileSync('sslcert/biin.io.key', 'utf8').toString();
var certificate = fs.readFileSync('sslcert/biin.io.crt', 'utf8').toString();
var ca1 = fs.readFileSync('sslcert/gd-biin.io-01.crt').toString();
var ca2 = fs.readFileSync('sslcert/gd-biin.io-01.crt').toString();
var credentials = {key: privateKey, cert: certificate, ca: [ca1,ca2]};

//Http Server instance
http.createServer(app).listen(httpPort, function () {
    console.log("Listing server");
});

//Https Server instance
if (!isDevelopment && !isQA && !isDemo) {
    https.createServer(credentials, app).listen(httpsPort, function () {
        console.log("Listing https server");
    });
}
