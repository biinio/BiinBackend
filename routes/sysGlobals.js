module.exports = function () {
	var functions = {};
	var fs = require('fs');
	var sysGlobals= require('../schemas/sysGlobals');
	
	//Set Fiil the standards enviroments variables
	functions.set=function(req,res){
		var enviroments=[{identifier:'99d803fb-3c4f-4276-9535-d17a1b0cf49d',mayorCounter:0,description:'Indoors Enviroment'}];
		sysGlobals.create(enviroments,function(err){
			if(err)
				throw err;
			else
				res.json({status:0});
		})
	}

	return functions;
};