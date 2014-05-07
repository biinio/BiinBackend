module.exports = function () {
	var region = require('../schemas/region');
	var functions = {};

	//GET the index view of a regions
	functions.index = function(req,res){
	
	}

	//GET the list of regions
	functions.list = function(req,res){
		region.find({},"identifier radious latitude longitude",function (err, data) {
			   res.json({"data":{"regions":data}});
		});		
	}

	return functions;
}