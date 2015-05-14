module.exports =function(){
	var fs=require('fs');
	var _= require('underscore');
	var math = require('mathjs');	
	var functions ={};
	var mobileUser = require('../schemas/mobileUser');
	var mobileHistory = require('../schemas/mobileHistory');
	var utils = require('../biin_modules/utils')(), moment = require('moment');
	var organization = require('../schemas/organization'), site = require('../schemas/site'), showcase = require('../schemas/showcase'),
		region= require('../schemas/region'), mobileHistory=require('../schemas/mobileHistory');
	
	
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

									//Remove the Organization
									for(var orgIndex =0; orgIndex<sitesCategories.length; orgIndex++){										
										if('sites' in sitesCategories[orgIndex] )
											for(var siteIndex=0; siteIndex<sitesCategories[orgIndex].sites.length ;siteIndex++){

													if( sitesCategories[orgIndex].sites[siteIndex].isValid=true && 'categories' in sitesCategories[orgIndex].sites[siteIndex] && sitesCategories[orgIndex].sites[siteIndex].categories.length>0){
														//Get the categories of the site
														var sitesCat = _.pluck(sitesCategories[orgIndex].sites[siteIndex].categories,'identifier')

														if(_.indexOf(sitesCat,pcategory.identifier)!=-1){
															if(isSiteInRegion(xcord,ycord,eval(sitesCategories[orgIndex].sites[siteIndex].lat),eval(sitesCategories[orgIndex].sites[siteIndex].lng))){
            													sitesResult.push({'identifier':sitesCategories[orgIndex].sites[siteIndex].identifier});
																cantSitesAdded++;																
															}
														}
													}
											}
									}	

									//Callback function
									var result = {'identifier' :pcategory.identifier,"name":pcategory.name , 'sites':sitesResult};
									callback(index,total,result,cantSitesAdded);									
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
			mobileUser.findOne({'identifier':biinieIdentifier},{showcaseNotified:1},getSiteInformation)
		}else{
			res.json({data:{status:"7",data:{}}});
		}
			
	}

 	//------------------  History Services  ------------------//
 	//Set a Mobile History Actions of an User
 	functions.setHistory=function(req,res){
 		var identifier = req.param('identifier');
 		var model = req.body.model;

 		mobileHistory.update({'identifier':identifier},{$set:{identifier:identifier}, $push:{actions:{$each:model.actions}}},{safe: true, upsert: true},function(err,affected){
			if(err)
 				res.json({status:"7",data:{}, error:err});
 			else
 				res.json({status:"0",data:{}});	
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

		var getShowcasesWebAvailable=function(siteIdentifier,callback){
			showcase.find({'webAvailable':siteIdentifier},{'_id':0,'identifier':1},function(err,data){
				if(err)
					throw err;
				var webAvailable= data;//_.pluck(data,'identifier');
				callback(webAvailable)
			});
		}

		newModel.proximityUUID= orgId;
		newModel.identifier = model.identifier;
		newModel.major =""+ model.major;
		newModel.country = model.country;
		newModel.state = model.state;
		newModel.city = model.city;
		newModel.zipCode = model.zipCode;		
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

		if(typeof(model.biins)!=='undefined'){
			newModel.biins=[];
			var date = utils.getDateNow();// This because some biins are was not created with lastUpdate
			var biinArray= 0;
			for(var i=0; i<model.biins.length;i++){
				if(typeof(model.biins[i].showcases)!='undefined' && model.biins[i].showcases.length>0){
					newModel.biins[biinArray]={};				
					newModel.biins[biinArray].identifier= model.biins[i].identifier;
					newModel.biins[biinArray].minor= "" +model.biins[i].minor;
					newModel.biins[biinArray].biinType= model.biins[i].biinType;
					newModel.biins[biinArray].lastUpdate= model.biins[i].lastUpdate?model.biins[i].lastUpdate:date;


					//Biins showcases
					if( model.biins[i].showcases.length>0){
						newModel.biins[biinArray].showcases=[];
						for(var j =0;j<model.biins[i].showcases.length;j++){
							 var biinShowcase = {};
							 biinShowcase.showcaseIdentifier = model.biins[i].showcases[j].showcaseIdentifier;
							 biinShowcase.isDefault=model.biins[i].showcases[j].isDefault;
							 biinShowcase.startTime= utils.getDate(biinShowcase.startTime);
							 biinShowcase.endTime= utils.getDate(biinShowcase.endTime);
							 biinShowcase.isUserNotified='0';
							 //Is showcase Notified
							if(mobileUser && ('showcaseNotified' in mobileUser)){
								var biinNot=_.findWhere(mobileUser.showcaseNotified,{siteIdentifier:siteId, showcaseIdentifier:biinShowcase.showcaseIdentifier});
								biinShowcase.isUserNotified=typeof(biinNot)!='undefined'?'1':'0';
							}

							 newModel.biins[biinArray].showcases.push(biinShowcase);
						}
					}
					//If is not there an identifier
					if(!model.biins[i].identifier)
						newModel.biins[biinArray].identifier= utils.getGUID();
					biinArray++;
				}
			}
		}		

		getShowcasesWebAvailable(siteId,function(webAvailable){

			newModel.webAvailable = [];
			if(webAvailable)
				newModel.webAvailable =webAvailable;
			
			//Return the result callback
			resultCallback(newModel)
		})
		
	}


	return functions;
}