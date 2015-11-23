#!/usr/bin/env node
require('dotenv').load();
var fs= require('fs'), http = require('http'), https = require('https'), util = require('util');
var debug = require('debug')('BinnCMS'),
	db=require('./biin_modules/db'),
	app = require('./biin_modules/app')(db);

//Define local vars
var isDevelopment = process.env.NODE_ENV === 'development';
var httpPort = process.env.PORT || 3000;
var httpsPort = 8443;

app.set('port',httpPort);

//Https credentials
var privateKey  = fs.readFileSync('sslcert/server.key', 'utf8').toString();;
var certificate = fs.readFileSync('sslcert/bundle.crt', 'utf8').toString();;
var credentials = {key: privateKey, cert: certificate};

//Http Server instance
var httpServer = http.createServer(app).listen(httpPort,function(){
	console.log("Listing server");
});

//Https Server instance
if(!isDevelopment){
	var httpsServer=https.createServer(credentials, app).listen(httpsPort,function(){
		console.log("Listing https server");
	});
}
