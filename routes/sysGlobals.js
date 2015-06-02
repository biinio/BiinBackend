module.exports = function () {
	var functions = {};
	var fs = require('fs');
	var sysGlobals= require('../schemas/sysGlobals');
	
	//Set Fiil the standards enviroments variables
	functions.set=function(req,res){
		var enviroments=[{identifier:'AABBCCDD-A101-B202-C303-AABBCCDDEEFF',mayorCounter:0,description:'Indoors Enviroment'}];
		sysGlobals.create(enviroments,function(err){
			if(err)
				throw err;
			else
				res.json({status:0});
		})
	}

	//Get a enviroment by identifier
	functions.getEnviroment= function(identifier,callback){
		sysGlobals.findOne({'identifier':identifier},function(err,data){
			callback(data)
		});
	}

	//Get and Update the Major of a Sys Global
	functions.incrementMajor=function(identifier,callback){
		sysGlobals.findOne({'identifier':identifier},function(err,enviroment){
			enviroment.majorCount++;			
			enviroment.save(function(err){
				callback(enviroment.majorCount)	
			})			
		});	
	}

	return functions;
};