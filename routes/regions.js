module.exports = function () {
	var math = require('mathjs');
	var region = require('../schemas/region'), utils = require('../biin_modules/utils')();
	var _= require('underscore');

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

	//GET the list of regions
	functions.listJson = function(req,res){
		region.find({},{"identifier":1,"radious":1,"latitude":1,"longitude":1},function (err, data) {
			res.json({"data":{"regions":data}, status:"0", result:"1"});
		});		
	}
	
	//Returns a region by calculing the proximity of the coord
	functions.getRegionByProximity=function(lat, lon, callback){
		region.find({},'',function(err,regions){
			if(err)
				throw err;
			else{

				var insideRegion={};
				var isInsideRegion=false;
				
				
				var lessDistance = 999999999999999999999999;
				//Iterate over the regions 
				for(var i =0; i< regions.length;i++){
				 	var region = regions[i];

				 	var resultLat = region.latitude - lat;
				 	var resultLong = region.longitude -lon;

				 	//Get the Radious in radians, = Radious in meters / kilometers * 360 / Earth Circunference
				 	var radiousRadians = ((region.STANDARD_RADIOUS/1000)*360)/process.env.EARTH_CIRCUMFERENCE;
				 	var distance= math.sqrt((resultLat*resultLat) + (resultLong*resultLong));				 	

				 	if(distance< radiousRadians){

				 		if(lessDistance == 999999999999999999999999){
				 			lessDistance = distance;
				 			insideRegion = region;
				 			isInsideRegion=true;
				 		}else{

				 			if(distance< lessDistance){
				 				lessDistance = distance;
				 				insideRegion =region;
				 			}else{
				 				console.log('This region ' +region.identifier+' is NOT closest than: ' + insideRegion);
				 			}
				 		}				 		
				 		
				 	}else{
				 		console.log('Is NOT inside: ')
				 	}

				}	

				callback(isInsideRegion, insideRegion)
			}		
		});		
	}	
	

	//Remove site in a region
	functions.removeSiteToRegion =function(regionId, siteIdentifier,callback)	{
		region.findOne({'identifier':regionId},function(err,regionFound){
			if(err)
				throw err;
			else{

				var siteFound =_.findWhere(region.sites,{identifier:siteIdentifier});
				if(siteFound){
					var siteIndex = region.sites.indexOf(siteFound);
					region.sites.splice(siteIndex,1);

				}
				callback(true);
			}

		})
	}

	//Remove site in a region
	functions.removeSiteToRegionBySite =function(siteIdentifier,callback)	{

		region.find({'sites.identifier':siteIdentifier},function(err,sitesFound){
			if(err)
				throw err;
			else{
				if(sitesFound)
					for(var i=0; i<sitesFound.length; i++){
						var siteToRemove = _.findWhere(sitesFound[i].sites,{identifier:siteIdentifier});
						var index = sitesFound[i].sites.indexOf(siteToRemove)
						sitesFound[i].sites.splice(index,1);
						sitesFound[i].save();
					}
					callback(true);
			}
		});

	}
	
	//Update a Region Site Categories
	functions.updateRegionSiteCategories=function(regionIdentifier,siteIdentifier,categories,callback){

		region.find({identifier:regionIdentifier,'sites.identifier':siteIdentifier},function(err,sitesFound){
			if(err)
				throw err;
			else{
				if(sitesFound)
					for(var i=0; i<sitesFound.length; i++){
						var siteToUpdate = _.findWhere(sitesFound[i].sites,{identifier:siteIdentifier});
						var index = sitesFound[i].sites.indexOf(siteToUpdate)
						sitesFound[i].sites[index].categories = categories;
						sitesFound[i].save();
					}
					callback(true);
			}
		});
	}
	//Add sites to a region
	functions.addSiteToRegion=function(regionIdentifier, site,callback){

		region.update({identifier:regionIdentifier},{$push:{sites:{identifier:site.identifier}}},function(err,raw){
			if(err)
				throw err
			else
				callback(raw.n>0,regionIdentifier);
		})
	}	

	//Create a region by lat and long
	functions.createRegion= function(lat,lon,site,callback){
		var newRegion = new region();
		newRegion.identifier = utils.getGUID();
		newRegion.radious = process.env.STANDARD_RADIOUS;
		newRegion.latitude = lat;
		newRegion.longitude = lon;
		newRegion.sites =[site];
		newRegion.save(function(err,regionSaved){
			if(err){
				throw err;
			}else{
				callback(true,regionSaved.identifier)
			}

		});
	}

	//Set the coordenades to a specific region
	functions.setCoordsToRegion = function(req,res){
		var regionIdentifier=req.params.identifier;
		var lat= req.params.latitude;
		var lng = req.params.longitude;

		region.findOne({identifier:regionIdentifier},function(err,regionObj){
			if(err)
				res.json({status:"5",data:{}});
			else{
				regionObj.latitude = lat;
				regionObj.longitude= lng;
				regionObj.save(function(err){
					if(err)
						res.json({status:"5",data:{}});
					else
						res.json({data:{status:"0",data:{}}});
				});
			}
			
		})
	}

	return functions;
}