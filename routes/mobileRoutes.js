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
		mobileUser.findOne({identifier:userIdentifier},{"categories.identifier":1,"categories.name":1},function(err,foundCategories){			
			if(err){
				res.json({data:{status:"5",data:{}}});
			}else{
				if(foundCategories && "categories" in foundCategories){

					if(foundCategories.categories.length===0)
						res.json({data:{status:"9",data:{}}});
					else{
						//var catArray = _.pluck(foundCategories.categories,'identifier')
						var result = {data:{categories:[]}};

						//Get The sites by Each Category
						var categoriesProcessed = 0;

						///Get the Sites By categories
						var getSitesByCat = function(pcategory, index, total, callback){
							//Return the sites by Categories
							var orgResult=organization.find({'sites.categories.identifier':pcategory.identifier},{"_id":0,"sites.identifier":1, "identifier":1},function(err,sitesCategories){
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
									var result = {'identifier' :pcategory.identifier,"name":pcategory.name , 'sites':sitesResult};
									callback(index,total,result);
									
								}

							});		

					}
					
				}

					var finalCursor=function(index,total,data){
						result.data.categories[index]=data;
						categoriesProcessed++;

						//Return the categories if all is processed
						if(categoriesProcessed===total){
							result.status="0";
							res.json(result);
						}				
					}

					//Order the sites by Category Identifier
					for(var i=0; i< foundCategories.categories.length;i++){						
						getSitesByCat(foundCategories.categories[i],i,foundCategories.categories.length,finalCursor);						
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
		var biinieIdentifier = req.param("biinieIdentifier");
		var siteId = req.param("identifier");
		if(siteId)
			organization.findOne({"sites.identifier":siteId},{"_id":0,"sites.$":1,"identifier":1},function(err, data){
				if(err)
					res.json({data:{status:"7",data:{}}});	
				else
					if(data==null)
						res.json({data:{status:"9",data:{}}});	
					else
						if(data.sites && data.sites.length){	

							var siteResult = mapSiteMissingFields(biinieIdentifier,data.identifier,data.sites[0]);
							res.json({data:siteResult,status:"0"});
						}
						else{
							res.json({data:data.sites[0],status:"0"});
						}
			});
	}

	//Map the Site information
	mapSiteMissingFields= function(biinieId,orgId,model){
		var newModel={};

		newModel.proximityUUID= orgId;
		newModel.identifier = model.identifier;
		newModel.major =""+ model.major;
		newModel.country = model.country;
		newModel.state = model.state;
		newModel.city = model.city;
		newModel.zipCode = model.zipCode;		
		//Map fields;

		newModel.title = model.title1;			
		newModel.subTitle = model.title1;
		newModel.titleColor = model.textColor.replace("rgb(","").replace(")","");
		newModel.zipCode = model.zipCode
		newModel.streetAddres1 = model.streetAddres?model.streetAddres:"";
		newModel.latitude =""+ model.lat;
		newModel.longitude =""+ model.lng;
		newModel.biinedCount =  model.biinedCount?""+model.biinedCount:"0";
		newModel.email = model.email?model.email:"";
		newModel.phoneNumber = model.phoneNumber?model.phoneNumber.trim().replace('-',''):"";

		var userbiined =_.findWhere(model.biinedUsers,{biinieIdentifier:biinieId});
		var userShare =_.findWhere(model.userShared,{biinieIdentifier:biinieId});
		var userComment =_.findWhere(model.userComments,{biinieIdentifier:biinieId});

		newModel.userBiined = typeof(userbiined)!=="undefined"?"1":"0";
		newModel.userShared = typeof(userShare)!=="undefined"?"1":"0";
		newModel.userCommented = typeof(userCommented)!=="undefined"?"1":"0";


		if(typeof(model.media)!='undefined' && model.media.length>0){
			newModel.media=[];
			for(var i=0; i<model.media.length;i++){
				newModel.media[i]={};				
				newModel.media[i].domainColor= model.media[i].mainColor.replace("rgb(","").replace(")");
				newModel.media[i].mediaType="1";
				newModel.media[i].imgUrl= model.media[i].imgUrl;
			}
		}

		if(typeof(model.biins)!='undefined'){
			newModel.biins=[];
			var date = utils.getDateNow();// This because some biins are was not created with lastUpdate
			for(var i=0; i<model.biins.length;i++){
				if(typeof(model.biins[i].showcasesAsigned)!='undefined' && model.biins[i].showcasesAsigned.length>0){
					newModel.biins[i]={};				
					newModel.biins[i].identifier= model.biins[i].identifier;
					newModel.biins[i].minor= "" +model.biins[i].minor;
					newModel.biins[i].biinType= model.biins[i].biinType;
					newModel.biins[i].lastUpdate= newModel.biins[i].lastUpdate?newModel.biins[i].lastUpdate:date;
					newModel.biins[i].showcaseIdentifier = model.biins[i].showcasesAsigned[0].showcaseIdentifier;

					//If is not there an identifier
					if(!model.biins[i].identifier)
						newModel.biins[i].identifier= utils.getGUID();
				}
			}
		}

		return newModel;
	}


	//Get a specific showcase
	functions.getShowcase =function(req,res){
		var identifier = req.param("identifier");
		showcase.findOne({"identifier":identifier},{"identifier":1,"name":1,"description":1,"titleColor":1,"lastUpdate":1,"theme":1,"elements.elementIdentifier":1,"elements._id":1},function(err,data){
			if(err)
				res.json({data:{status:"7",data:{}}});	
			else
				if(typeof(data)==='undefined' || data===null || data.length===0)
					res.json({data:{status:"9",data:{}}});	
				else{
					var showcaseObj = {}

					showcaseObj.title = data.name?data.name:"";
					showcaseObj.subTitle= data.description?data.description:"";
					showcaseObj.titleColor=data.titleColor?data.titleColor.replace('rgb(','').replace(')',''):"0,0,0";
					showcaseObj.lastUpdate = data.lastUpdate& data.lastUpdate!=""?data.lastUpdate:utils.getDateNow();
					showcaseObj.identifier = data.identifier?data.identifier:"";
					showcaseObj.theme = data.theme?data.theme:"";
					showcaseObj.elements = data.elements;

					res.json({data:showcaseObj,status:"0"});
				}
		})

	}
	return functions;
}