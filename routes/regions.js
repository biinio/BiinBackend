module.exports = function () {
	var region = require('../schemas/region');
	var functions = {};

	//GET the index view of a regions
	functions.index = function(req,res){
		region.find({},"identifier radious latitude longitude",function (err, data) {
			   res.render("region/index",{title:'Regions',				
			 user:req.user, regions:data});
		});				
	}

	//GET the index view of a regions
	functions.create = function(req,res){
		res.render("region/create",{title:'Regions',user:req.user});
	}	
	
	//Post creation of a region
	functions.createPost = function(req,res){

	 region.findOne({},"biins",function (err, data) {
			var regionToCreate = new region();
			 regionToCreate.identifier = req.body.identifier;
			 regionToCreate.radious = req.body.radious;
			 regionToCreate.latitude = req.body.latitude;
			 regionToCreate.longitude = req.body.longitude;
			 regionToCreate.biins = data.biins;
			 regionToCreate.save(function(err,regionSaved){
			 	if(err){
			 		throw err;
			 	}else{
			 		console.log(regionSaved)
			 		res.redirect("/regions")
			 	}

			 })
			  
	 });	
	 
	}	

	//GET the list of regions
	functions.listJson = function(req,res){
		region.find({},"identifier radious latitude longitude",function (err, data) {
			   res.json({"data":{"regions":data}});
		});		
	}

	return functions;
}