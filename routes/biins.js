module.exports = function () {
	var region = require('../schemas/region');	
	var functions = {};

	//GET the index view of a regions
	functions.index = function(req,res){
	
	}

	//GET the list of regions
	functions.listJson = function(req,res){
		var regionParam = req.param('region');
		console.log("region: "+regionParam);
		region.findOne({identifier:regionParam},'biins',function (err, data) {
			   res.json({"data":data});
		});		
	}

	functions.getByShowcase=function(req,res){
		var showcase =req.param('showcase');
		region.findOne({'biins.$.showcaseIdentifier':showcase},'biins.identifier', function(err,data){

		});
	}

	return functions;
}