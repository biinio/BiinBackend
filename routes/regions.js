module.exports = function () {
	var math = require('mathjs');
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
			 		console.log(regionSaved);
			 		res.redirect("/regions");
			 	}

			 })
			  
	 });	
	 
	}	

	//GET the index view of a regions
	functions.edit = function(req,res){
		var identifier = req.params.identifier;
		region.findOne({identifier:identifier},"",function(err, data){
			res.render("region/edit",{title:'Region edit',user:req.user,region:data});
		});	

	}	

	//GET the index view of a regions
	functions.editPost = function(req,res){
		var identifier = req.params.identifier;
		region.findOne({identifier:identifier},"",function(err, data){
			//update the model
			data.identifier = req.body.identifier;
			data.radious = req.body.radious;
			data.latitude=req.body.latitude;
			data.longitude=req.body.longitude;

			data.save(function(err,regionSaved){
		 		if(err){
			 		throw err;
			 	}else{
			 		res.redirect("/regions")
			 	}
			});
		});	

	}

	//Returns a region by calculing the proximity of the coord
	functions.getRegionByProximity=function(lat, lon){
		region.find({},'',function(err,regions){
			if(err)
				throw err;
			else{

				var regionCloser={};
				var closerValue=0;

				var insideRegion=0;
				//Iterate over the regions 
				for(var i =0; i, regions.length;i++){
				 	var region = rebion[i];

				 	var resultLat = region.latitude - lat;
				 	var resultLong = region.longitude -lon;

				 	console.log('Region: '+ region.identifier);
				 	console.log('Lat: '+ region.latitude);
				 	console.log('Long: '+ region.longitude);
					console.log('Radious: '+ region.radious);

					console.log('Result Lat: '+ resultLat)
					console.log('Result Long: '+ resultLong)

				 	var distance= math.sqrt((resultLat*resultLat) + (resultLong*resultLong));

				 	console.log('Distance: '+ distance);	

				 	console.log('Analizing if is inside the region');
				 	if(distance< region.radious){
				 		console.log('Inside region: ')
				 		insideRegion = region.identifier;
				 		//regionCloser
				 	}

				 	if(closerValue=0){
				 		closerValue = distance;
				 	}

				}	
			}		
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