module.exports =function(){
	var fs=require('fs');
	var _= require('underscore');
	var functions ={};
	var mobileUser = require('../schemas/mobileUser');
	var utils = require('../biin_modules/utils')();

	var organization = require('../schemas/organization'), site = require('../schemas/site'), showcase = require('../schemas/showcase');

	
	
	//GET Categories
	/*
	functions.getCategories=function(req,res){
		var jsonObj= fs.readFileSync("./public/workingFiles/biinFakeJsons/getCategories.json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}


	//GET Site
	functions.getSite=function(req,res){
		var site = req.param("identifier");
		var jsonObj= fs.readFileSync('./public/workingFiles/biinFakeJsons/sites/'+site+".json", "utf8");
		res.json(JSON.parse(jsonObj));
	}
	*/

	//GET Regions
	functions.getRegions=function(req,res){
		var jsonObj= fs.readFileSync("./public/workingFiles/biinFakeJsons/getRegions.json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}

	//GET Element
	functions.getElement=function(req,res){
		var element = req.param("identifier");
		var jsonObj= fs.readFileSync('./public/workingFiles/biinFakeJsons/elements/'+element+".json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}


	//GET Site
	/*functions.getShowcase=function(req,res){
		var showcase = req.param("identifier");
		var jsonObj= fs.readFileSync('./public/workingFiles/biinFakeJsons/showcases/'+showcase+".json", "utf8");
		res.json(JSON.parse(jsonObj));
	}*/

	//GET Categories
	functions.getCategories=function(req,res){
		var userIdentifier = req.param("identifier");
		var xcord = req.param("xcord");
		var ycord = req.param("ycord");

		//Todo Implements Coordinates routes

		//Get the categories of the user
		mobileUser.findOne({identifier:userIdentifier},{"categories.identifier":1},function(err,foundCategories){			
			if(err){
				res.json({data:{status:"5",data:{}}});
			}else{
				if(foundCategories && "categories" in foundCategories){

					//var catArray = _.pluck(foundCategories.categories,'identifier')
					var result = {data:{categories:[]}};

					//Get The sites by Each Category
					var categoriesProcessed = 0;

					///Get the Sites By categories
					var getSitesByCat = function(pcategory, index, total, callback){
						//Return the sites by Categories
						var orgResult=organization.find({'sites.categories.identifier':pcategory},{"_id":0,"sites.identifier":1, "identifier":1},function(err,sitesCategories){
							if(err)
								res.json({data:{status:"5",data:{}, err:err}});
							else
							{
								var sitesResult=[];

								//Remove the Organization
								for(var orgIndex =0; orgIndex<sitesCategories.length; orgIndex++){
									if('sites' in sitesCategories[0])
										for(var siteIndex=0; siteIndex<sitesCategories[orgIndex].sites.length ;siteIndex++){
												sitesResult.push({'identifier':sitesCategories[orgIndex].sites[siteIndex].identifier});
										}
								}	

								//Callback function
								var result = {'identifier' :pcategory, 'sites':sitesResult};
								callback(index,total,result);
								
							}

						});		

					}

					var finalCursor=function(index,total,data){
						result.data.categories[index]=data;
						categoriesProcessed++;

						//Return the categories if all is processed
						if(categoriesProcessed===total){
							result.status=0;
							res.json(result);
						}				
					}

					//Order the sites by Category Identifier
					for(var i=0; i< foundCategories.categories.length;i++){						
						getSitesByCat(foundCategories.categories[i].identifier,i,foundCategories.categories.length,finalCursor);						
					}					
				}
				else{
					res.json({status:"9",data:{}});	
				}
			}
		});
	}

	//GET Site
	functions.getSite=function(req,res){
		var siteId = req.param("identifier");
		if(siteId)
			organization.findOne({"sites.identifier":siteId},{"_id":0,"sites.$":1},function(err, data){
				if(err)
					res.json({data:{status:"7",data:{}}});	
				else
					if(data==null)
						res.json({data:{status:"9",data:{}}});	
					else
						if(data.sites && data.sites.length){	

							var siteResult = mapSiteMissingFields(data.sites[0]);
							res.json({data:siteResult,status:0});
						}
						else{
							res.json({data:data.sites[0],status:0});
						}
			});
	}

	//Map the Site information
	mapSiteMissingFields= function(model){
		var newModel={};

		newModel.proximityUUID= model.proximityUUID; 
		newModel.identifier = model.identifier;
		newModel.major = model.major;
		newModel.contry = model.contry;
		newModel.state = model.state;
		newModel.city = model.city;
		newModel.zipCode = model.zipCode;		
		//Map fields;

		newModel.title = model.title1;			
		newModel.subTitle = model.title1;
		newModel.mainColor = model.textColor;
		newModel.subtitleColor = model.textColor;//* Deprecated
		newModel.zipCode = model.zipCode
		newModel.streetAddres = model.streetAddres1;
		newModel.latitude = model.lat;
		newModel.longitude = model.lng;

		if(typeof(model.media)!='undefined' && model.media.length>0){
			newModel.media=[];
			for(var i=0; i<model.media.length;i++){
				newModel.media[i]={};
				newModel.media[i].imgUrl= model.media[i].url;
				newModel.media[i].domainColor= "";
				newModel.media[i].type="1";
			}
		}

		if(typeof(model.biins)!='undefined'){
			newModel.biins=[];
			var date = utils.getDateNow();
			for(var i=0; i<model.biins.length;i++){
				if(typeof(model.biins[i].showcasesAsigned)!='undefined' && model.biins[i].showcasesAsigned.length>0){
					newModel.biins[i]={};//model.biins[i];					
					newModel.biins[i].proximityUUID= model.biins[i].proximityUUID;
					newModel.biins[i].identifier= model.biins[i].identifier;
					newModel.biins[i].minor= model.biins[i].minor;
					newModel.biins[i].lastUpdate=date;
					newModel.biins[i].showcaseIdentifier = model.biins[i].showcasesAsigned[0].showcaseIdentifier;
				}
			}
		}

		return newModel;
	}


	//Get a specific showcas
	functions.getShowcase =function(req,res){
		var identifier = req.param("identifier");
		showcase.find({"identifier":identifier},{"identifier":1,"elements.identifier":1,"elements._id":1},function(err,data){
			if(err)
				res.json({data:{status:"7",data:{}}});	
			else
				if(typeof(data)==='undefined' || data===null || data.length===0)
					res.json({data:{status:"9",data:{}}});	
				else{
					res.json({data:data,status:0});
				}
		})

	}
	return functions;
}