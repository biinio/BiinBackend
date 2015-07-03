module.exports =function(){
	var fs=require('fs');
	var _= require('underscore');
	var math = require('mathjs'), moment = require('moment-timezone');
	var util = require('util');

	var functions ={};
	var mobileUser = require('../schemas/mobileUser');
	var mobileHistory = require('../schemas/mobileHistory');
	var utils = require('../biin_modules/utils')(), moment = require('moment');
	var organization = require('../schemas/organization'), site = require('../schemas/site'), showcase = require('../schemas/showcase'),
		region= require('../schemas/region'), mobileHistory=require('../schemas/mobileHistory'),  biin = require('../schemas/biin'), siteCategory = require('../schemas/searchSiteCategory');

	var biinBiinieObject =require('../schemas/biinBiinieObject');
	
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
	/*functions.getRegions=function(req,res){
		var jsonObj= fs.readFileSync("./public/workingFiles/biinFakeJsons/getRegions.json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}*/

	//GET Element
	/*functions.getElement=function(req,res){
		var element = req.param("identifier");
		var jsonObj= fs.readFileSync('./public/workingFiles/biinFakeJsons/elements/'+element+".json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}*/


	//GET Site
	/*functions.getShowcase=function(req,res){
		var showcase = req.param("identifier");
		var jsonObj= fs.readFileSync('./public/workingFiles/biinFakeJsons/showcases/'+showcase+".json", "utf8");
		res.json(JSON.parse(jsonObj));
	}*/
	//[DEPRECATED]
	//GET Sites information by Biinie Categories
	functions.getCategories=function(req,res){
		var userIdentifier = req.param("identifier");
		var xcord = eval(req.param("xcord"));
		var ycord = eval(req.param("ycord"));
		var enviromentId = process.env.DEFAULT_SYS_ENVIROMENT;

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
						var categoriesWithSites=0;

						///Get the Sites By categories
						var getSitesByCat = function(pcategory, index, total, callback){
							//Return the sites by Categories
							var orgResult=organization.find({'sites.categories.identifier':pcategory.identifier, "sites.isValid":true},{"_id":0,"sites.identifier":1,"sites.major":1,'sites.lat':1,'sites.lng':1,"sites.categories.identifier":1,"sites.categories.identifier":1,"sites.isValid":1, "identifier":1,},function(err,sitesCategories){
								if(err)
									res.json({data:{status:"5",data:{}, err:err}});
								else
								{
									var sitesResult=[];
									var cantSitesAdded =0;
									var hasBiinsToProve=false;
									var countHasBiins=0;
									var hasBiinsProved=0;
									//Remove the Organization
									for(var orgIndex =0; orgIndex<sitesCategories.length; orgIndex++){										
										if('sites' in sitesCategories[orgIndex] )
											for(var siteIndex=0; siteIndex<sitesCategories[orgIndex].sites.length ;siteIndex++){														
													if( sitesCategories[orgIndex].sites[siteIndex].isValid=true && 'categories' in sitesCategories[orgIndex].sites[siteIndex] && sitesCategories[orgIndex].sites[siteIndex].categories.length>0){
														//Get the categories of the site
														var sitesCat = _.pluck(sitesCategories[orgIndex].sites[siteIndex].categories,'identifier')

														if(_.indexOf(sitesCat,pcategory.identifier)!=-1){
															if(isSiteInRegion(xcord,ycord,eval(sitesCategories[orgIndex].sites[siteIndex].lat),eval(sitesCategories[orgIndex].sites[siteIndex].lng))){
																hasBiinsToProve =true;
																var hasbiins =function(siteIdentifier){
																	//TODO: Modify this
																	biin.findOne({'siteIdentifier':siteIdentifier},function(err, biinForSite){
																		if(err)
																			throw err;
																		else{
																			hasBiinsProved++;;
																			if(biinForSite)	{
																				sitesResult.push({'identifier':siteIdentifier});
																				cantSitesAdded++;
																			}
																			
																			if(countHasBiins===hasBiinsProved){
																				//Callback function
																				var result = {'identifier' :pcategory.identifier,"name":pcategory.name , 'sites':sitesResult};
																				callback(index,total,result,cantSitesAdded);																														
																			}																			
																		}
																	})			

																}

																countHasBiins++;	
																hasbiins(sitesCategories[orgIndex].sites[siteIndex].identifier);
            													
															}
														}
													}
											}
									}	

									if(!hasBiinsToProve){
										//Callback function
										var result = {'identifier' :pcategory.identifier,"name":pcategory.name , 'sites':sitesResult};
										callback(index,total,result,cantSitesAdded);																			
									}

								}

							});		

					}
					
				}

					var finalCursor=function(index,total,data,cantSites){

						if(cantSites>0){
							result.data.categories.push(data)
							categoriesWithSites++;
						}

						categoriesProcessed++;

						//Return the categories if all is processed
						if(categoriesProcessed===total){

							if(categoriesWithSites==0){
								res.json({data:{status:"9",data:{}}});

							}
							else{
								result.status="0";
								res.json(result);
							}

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

	//Verify if the coords of the user and the site are in the expected radio
	function isSiteInRegion(mobX, mobY,siteX,siteY){
		//Get the Radious in radians, = Radious in meters / kilometers * 360 / Earth Circunference
		if(!eval(process.env.ALLOW_LOCATION_FILTER))
			return true;
		else{
			var radiousRadians = ((eval(process.env.STANDARD_RADIOUS)/1000)*360)/eval(process.env.EARTH_CIRCUMFERENCE);
		 	var resultLat = siteX -mobX;
		 	var resultLong = siteY - mobY;
			var distance= math.sqrt((resultLat*resultLat) + (resultLong*resultLong));

			return distance<= radiousRadians;			
		}		
	}

	//
	//GET Site
	functions.getSite=function(req,res){

		var identifier=req.param("identifier");		
		var biinieIdentifier = req.param("biinieIdentifier");

		var getSiteInformation = function(err,mobileUser){

			if(err)
				res.json({data:{status:"7",data:{}}});	
			else{
				organization.findOne({"sites.identifier":identifier},{"_id":0,"sites.$":1,"identifier":1},function(err, data){
					if(err)
						res.json({data:{status:"7",data:{}}});	
					else
						if(data==null)
							res.json({data:{status:"9",data:{}}});	
						else
							if(data.sites && data.sites.length){	

								mapSiteMissingFields(biinieIdentifier,data.sites[0].identifier,data.identifier,data.sites[0],mobileUser,function(siteResult){
									res.json({data:siteResult,status:"0"});
								});
								
							}
							else{
								res.json({data:data.sites[0],status:"0"});
							}
				});
			}			
		}
		if(biinieIdentifier){
			mobileUser.findOne({'identifier':biinieIdentifier},{showcaseNotified:1, biinieCollections:1},getSiteInformation)
		}else{
			res.json({data:{status:"7",data:{}}});
		}		
	}

 	//------------------  History Services  ------------------//
 	//Set a Mobile History Actions of an User
 	functions.setHistory=function(req,res){
 		var identifier = req.param('identifier');
 		var model = req.body.model;

 		mobileHistory.update({'identifier':identifier},{$set:{identifier:identifier}, $push:{actions:{$each:model.actions}}},{safe: true, upsert: true},function(err,raw){
			if(err)
 				res.json({status:"7",data:{}, error:err});
 			else
 				res.json({status:"0",result:"1"});	
 		});
 	}

 	functions.getHistory =function(req,res){
 		var identifier = req.param('identifier') 	

 		mobileHistory.findOne({identifier:identifier},function(err,data){
 			if(err || !(data))
 				res.json({status:"7",data:{}});
 			else
 				res.json({status:"0",data:data.actions});	

 		}) 			
 	}
	//Map the Site information
	mapSiteMissingFields= function(biinieId,siteId,orgId,model,mobileUser,resultCallback){
		var newModel={};

		//Get the showcases available
		var getShowcasesWebAvailable=function( orgIdentifier,siteIdentifier, callback){
			var cantShowcasesAdded=0;
			var cantSites=0;
			organization.findOne({identifier:orgIdentifier,'sites.identifier':siteIdentifier},{'_id':0,'sites.$':1},function(err,data){
				if(err)
					throw err;
				var showcases = [];
				var site = data.sites[0];
				var sitesIdentifier= _.pluck(site.showcases,'showcaseIdentifier');

				if(site.showcases){
					showcase.find({'identifier':{$in:sitesIdentifier}},{identifier:1,elements:1},function(err,foundShowcases){
						if(err)
							throw err;
						else{

							for(var siteShowcase=0; siteShowcase < sitesIdentifier.length;siteShowcase++){
								var highLighEl =[];
								console.log("Site Identifier: "+sitesIdentifier[siteShowcase]);
								console.log("Found Showcase: " +util.inspect(foundShowcases));						
								var showcaseInfo = _.findWhere(foundShowcases,{'identifier':sitesIdentifier[siteShowcase]})
								 console.log("the showcase: " +util.inspect(showcaseInfo));
								 
								 if(showcaseInfo){
									if(showcaseInfo && showcaseInfo.elements){
										for(var el =0 ;el<showcaseInfo.elements.length;el++){
											if(showcaseInfo.elements[el].isHighlight=='1'){
												highLighEl.push({elementIdentifier:showcaseInfo.elements[el].elementIdentifier});
											}
										}	
									}
									
									showcases.push({'identifier':showcaseInfo.identifier,'highlightElements':highLighEl});	 	
								 }
								
							}

							/*
							for(var showCaseInd=0;showCaseInd<foundShowcases.length;showCaseInd++){
								var highLighEl =[];

								for(var el =0 ;el<foundShowcases[showCaseInd].elements.length;el++){
									if(foundShowcases[showCaseInd].elements[el].isHighlight=='1'){
										highLighEl.push({elementIdentifier:foundShowcases[showCaseInd].elements[el].elementIdentifier});
									}
								}
								showcases.push({'identifier':foundShowcases[showCaseInd].identifier,'highlightElements':highLighEl});	
							}*/
							callback(showcases)							
						}

					});					
				}else{
					callback(showcases)
				}				
			});
		}

		//Get the biins available
		var getSiteBiins =function(siteIdentifier,callback){

			biin.find({'siteIdentifier':siteIdentifier, 'status':'Installed'}).lean().exec(function(err,biinsData){
				if(err)
					throw err;
				else{
					var processedBiins =0;

					if(biinsData.length===0)
						callback(biinsData);
					else{
						for(var iBiin =0; iBiin<biinsData.length;iBiin++){					

							//Get the Biins Data
							var getBiinsObjectsData=function(myIBiinIndex){
								biinBiinieObject.find({'biinieIdentifier':biinieId,'biinIdentifier':biinsData[myIBiinIndex].identifier},function(err,biinsObjects){
									var defaultCollection = 0;
									if(err)
										throw err;
									else{
										for(var o =0; o<biinsData[myIBiinIndex].objects.length;o++){								

											var startTime =moment.tz(biinsData[myIBiinIndex].objects[o].startTime,'America/Costa_Rica');
											var endtime = moment.tz(biinsData[myIBiinIndex].objects[o].endTime,'America/Costa_Rica');									

											var oData= null;									
											if(biinsData[myIBiinIndex].objects)									
												oData=_.findWhere(biinsObjects,{'identifier':biinsData[myIBiinIndex].objects[o].identifier});
											var el =null;
											if(mobileUser.biinieCollections && mobileUser.biinieCollections[defaultCollection] && mobileUser.biinieCollections[defaultCollection].elements)
												el= _.findWhere(mobileUser.biinieCollections[defaultCollection].elements,{identifier:biinsData[myIBiinIndex].objects[o].identifier})

											biinsData[myIBiinIndex].objects[o].isUserNotified = oData?'1':'0';																			
											biinsData[myIBiinIndex].objects[o].isBiined =	el?'1':'0';

											//Time options
											biinsData[myIBiinIndex].objects[o].startTime= ""+ (eval(startTime.hours()) + eval(startTime.minutes()/60));
											biinsData[myIBiinIndex].objects[o].endTime= ""+ (eval(endtime.hours()) + eval(endtime.minutes()/60));

										}
										processedBiins++;

										//format the biins
										if(processedBiins==biinsData.length)
											callback(biinsData);
									}							
								});
							}

							getBiinsObjectsData(iBiin);
						}
					}
				}
					
			});
		}

		//Get the Neibors fo the site
		var getNeighbords =function(siteIdentifier,callback){
			var neighbors = [];

			siteCategory.find({"sites.identifier":siteIdentifier},{'sites.$':1},function(err,sitesCategoryFound){
				if(err)
					throw err;
				else{
					//For each site categoy found
					for(var i=0; i<sitesCategoryFound.length;i++){
						neighbors = _.union(neighbors, sitesCategoryFound[i].sites[0].neighbors);
					}
					var neighbors = _.uniq(neighbors, function(item, key, a) { 
					    return item.siteIdentifier;
					});
					neighbors =  _.sortBy(neighbors, 'proximity');
					callback(neighbors);
				}
			});
		}

		newModel.proximityUUID= model.proximityUUID;
		newModel.identifier = model.identifier;
		newModel.major =""+ model.major;
		newModel.country = model.country;
		newModel.state = model.state;
		newModel.city = model.city;
		newModel.zipCode = model.zipCode;		
		newModel.ubication = model.ubication;
		//Map fields;

		newModel.title = model.title1;			
		newModel.subTitle = model.title2;
		newModel.titleColor = model.textColor.replace("rgb(","").replace(")","");
		newModel.zipCode = model.zipCode
		newModel.streetAddress1 = model.streetAddres?model.streetAddres:"";
		newModel.latitude =""+ model.lat;
		newModel.longitude =""+ model.lng;
		newModel.biinedCount =  model.biinedCount?""+model.biinedCount:"0";
		newModel.email = model.email?model.email:"";
		newModel.nutshell = model.nutshell?model.nutshell:"";
		newModel.phoneNumber = model.phoneNumber?model.phoneNumber.trim().replace('-','').replace('+',''):"";

		var userbiined =_.findWhere(model.biinedUsers,{biinieIdentifier:biinieId});
		var userShare =_.findWhere(model.userShared,{biinieIdentifier:biinieId});
		var userComment =_.findWhere(model.userComments,{biinieIdentifier:biinieId});

		newModel.userBiined = typeof(userbiined)!=="undefined"?"1":"0";
		newModel.userShared = typeof(userShare)!=="undefined"?"1":"0";
		newModel.userCommented = typeof(userCommented)!=="undefined"?"1":"0";
		newModel.commentedCount = model.commentedCount?""+model.commentedCount:"0";

		//If is not loyalty
		if(!('loyalty' in newModel)){
			newModel.loyalty ={
	                isSubscribed:"0",
	                subscriptionDate:"2014-01-01 12:00:00",
	                points:"0",
	                level:"0",
	                achievements: [
	                    {
	                        achievementIdentifier:"0"
	                    }
	                ],
	                badges: [
	                    {
	                        badgeIdentifier:"0"
	                    }
	                ]
	        }
		}

		if(typeof(model.media)!='undefined' && model.media.length>0){
			newModel.media=[];
			for(var i=0; i<model.media.length;i++){
				newModel.media[i]={};				
				newModel.media[i].domainColor= model.media[i].mainColor.replace("rgb(","").replace(")");
				newModel.media[i].mediaType="1";
				newModel.media[i].imgUrl= model.media[i].imgUrl;
			}
		}

		//Get the asyc Information

		var showcaseReady=false;
		var biinsReady=false;
		var neighborsReady=false;

		//Get showcase available
		getShowcasesWebAvailable(orgId,siteId,function(showcases){

			newModel.showcases = [];
			if(showcases)
				newModel.showcases =showcases;
			showcaseReady=true;

			if(showcaseReady&&biinsReady && neighborsReady){
				//Return the result callback
				resultCallback(newModel)
			}
		});

		//Get the Biins available
		getSiteBiins(siteId,function(biinsData){
			newModel.biins=biinsData
			biinsReady=true;
			if(showcaseReady&&biinsReady && neighborsReady){
				//Return the result callback
				resultCallback(newModel)
			}
		});

		getNeighbords(siteId,function(siteNeibors){
			newModel.neighbors=siteNeibors;
			neighborsReady=true;

			if(showcaseReady&&biinsReady && neighborsReady){
				//Return the result callback
				resultCallback(newModel)
			}			
		});
	}


	return functions;
}