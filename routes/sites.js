module.exports = function () {
	//Custom Utils
	var utils = require('../biin_modules/utils')(),
		util = require('util'), 
		routesUtils = require('../biin_modules/routesUtils')(),
		math = require('mathjs'),
		_= require('underscore');
	//Schemas
	var organization = require('../schemas/organization'),  site = require('../schemas/site'),
					   biin = require('../schemas/biin'), siteCategory = require('../schemas/searchSiteCategory'),
					   mobileUser = require('../schemas/mobileUser');	

	var sysGlobalsRoutes = require('./sysGlobals')();
	var regionRoutes = require('../routes/regions')();
	var functions={};

	//GET the main view of sites
	functions.index = function(req,res){

		var organizationId =req.param("identifier");

		var callback= function(organization,req, res){
			res.render('site/index', { title: 'Sites list' , user:req.user, organization:organization, isSiteManteinance:true});
		}

		routesUtils.getOrganization(req.param("identifier"),req,res,{name:true, identifier:true},callback)
	}

	functions.mapComponent = function(req, res) {
        res.render('site/_partials/mapComponent');
    }

	//GET the list of sites by organization Identifier
	functions.get= function(req,res){
			
		var callback = function(sites,req,res){
			//Set the biin prototype
			var biinPrototype =new biin();
			biinPrototype.proximityUUID = req.param('identifier');

			res.json({data:sites, prototypeObj:new site(), prototypeObjBiin:biinPrototype});
		}

		getOganization(req, res, callback);				  
	}

	//GET Sites User categories and proximity
	functions.getMobileByCategories=function(req,res){
		var userIdentifier = req.param("identifier");
		var userLat = eval(req.param("latitude"));
		var userLng = eval(req.param("longitude"));
		var enviromentId = process.env.DEFAULT_SYS_ENVIROMENT;

		var maxLatModifiers=0;
		var maxLngModifiers=0
		var invertSearch=false;
		var cantSites =0;
		

		var categorySitesResult={categories:[]};
		var catAdded=[]
		var searchSitesByCategory =function(userCategories,catArray,lat,lng,callback){

			var queryMinLat ={min_latitude:{$lte:lat}};
			var queryMaxLat ={max_latitude:{$gte:lat}};
			var queryMinLng = {min_longitude:{$lte:lng}};
			var queryMaxLng = {max_longitude:{$gte:lng}};

			if(lat<0){
				queryMinLat ={min_latitude:{$gte:lat}};
				queryMaxLat ={max_latitude:{$lte:maxLngModifiers}}
			}
			if(lng<0){
				queryMinLng = {min_longitude:{$gte:lng}};
				queryMaxLng = {max_longitude:{$lte:maxLngModifiers}}
			}

			var locationFilter = [queryMinLat,queryMinLng,queryMaxLat,queryMaxLng];
			siteCategory.find({categoryIdentifier:{$in:catArray},$and:locationFilter},{_id:0,categoryIdentifier:1,"sites.identifier":1},function(err,foundSearchSites){
				for(var c=0;c< foundSearchSites.length; c++){
					if(foundSearchSites[c].sites.length){
						var category = _.findWhere(categorySitesResult.categories,{identifier:foundSearchSites[c].categoryIdentifier});					
						if(category)
							category.sites = category.sites.concat(foundSearchSites[c].sites);
						else{
							var catInfo = _.findWhere(userCategories,{identifier:foundSearchSites[c].categoryIdentifier});
							categorySitesResult.categories.push({identifier:catInfo.identifier, name:catInfo.name, sites: foundSearchSites[c].sites, hasSites:'1'});
							catAdded.push(foundSearchSites[c].categoryIdentifier);							
						}						
						cantSites += foundSearchSites[c].sites.length;
					}					
				}				
				callback();
			});
		}

		//Get the categories of the user
		mobileUser.findOne({identifier:userIdentifier},{"categories.identifier":1,"categories.name":1},function(err,foundCategories){			
			if(err){
				res.json({data:{},status:"5",result:""});
			}else{
				if(foundCategories && "categories" in foundCategories){

					if(foundCategories.categories.length===0)
						res.json({data:{},status:"9",response:"0"});
					else{


						var catArray = _.pluck(foundCategories.categories,'identifier')
						var result = {data:{categories:[]}};

						if(eval(process.env.ALLOW_LOCATION_FILTER)===true){
							var latInc = userLat;
							var lngInc= userLng;
							maxLatModifiers = userLat;
							maxLngModifiers = userLng;
							var radiousRad = utils.metersToRadians(process.env.STANDARD_RADIOUS);
							var searchAndReturn =function(lat,lng){
								//Search the sites by user categories and proximity						
								searchSitesByCategory(foundCategories.categories,catArray,lat,lng,function(){
									if(cantSites===0){									
										if(lat>0){
											latInc =latInc +radiousRad;
											maxLatModifiers = maxLatModifiers-radiousRad;
										}										
										else{
											latInc = latInc - radiousRad;
											maxLatModifiers = maxLatModifiers + radiousRad;
										}
										if(lng>0){
											lngInc = lngInc +radiousRad;
											maxLngModifiers = maxLngModifiers - radiousRad;
										}										
										else{
											lngInc = lngInc - radiousRad;
											maxLngModifiers= maxLngModifiers +radiousRad;
										}

										searchAndReturn(latInc,lngInc);

									}else{
										//Fill not retrieve categories sites
										var notFoundCatSites=_.difference(catArray,catAdded);
										for(var ntSites=0; ntSites<notFoundCatSites.length;ntSites++){
											var catInfo = _.findWhere(foundCategories.categories,{identifier:notFoundCatSites[ntSites]});
											categorySitesResult.categories.push({identifier:catInfo.identifier, name:catInfo.name, sites: [], hasSites:'0'});
										}									
										//Return the sites data
										res.json({data:categorySitesResult,status:'0',result:"1"});
									}
								});								
							}
							searchAndReturn(userLat,userLng);
						}else{
							getAllSitesByCategories(userIdentifier,userLat,userLng,foundCategories.categories,catArray,function(categorySitesResult,cantSites,catAdded){
							//Fill not retrieve categories sites
								var notFoundCatSites=_.difference(catArray,catAdded);
								for(var ntSites=0; ntSites<notFoundCatSites.length;ntSites++){
									var catInfo = _.findWhere(foundCategories.categories,{identifier:notFoundCatSites[ntSites]});
									categorySitesResult.categories.push({identifier:catInfo.identifier, name:catInfo.name, sites: [], hasSites:'0'});
								}										
								res.json({data:categorySitesResult,status:'0',result:"1"});
							})
						}
						
					}
				}	
				else{
					res.json({status:"9",data:{},result:"0"});	
				}
			}
		});		
	}


	var getAllSitesByCategories = function(userIdentifier, userLat, userLng, userCategories,catArray,callback){
		var cantSites =0;
		var categorySitesResult={categories:[]};
		var catAdded=[]
		siteCategory.find({categoryIdentifier:{$in:catArray}},{_id:0,categoryIdentifier:1,"sites.identifier":1,"sites.lng":1,"sites.lat":1}).lean().exec(function(err,foundSearchSites){
			for(var c=0;c< foundSearchSites.length; c++){
				if(foundSearchSites[c].sites.length){
					var category = _.findWhere(categorySitesResult.categories,{identifier:foundSearchSites[c].categoryIdentifier});		
					var filteredsites = _.filter(foundSearchSites[c].sites, function(site){ return site.lat && site.lng });
					for(var csF=0;csF<filteredsites.length;csF++){
						//cal Binnie prox
						filteredsites[csF].biinieProximity = ""+utils.getProximity(userLat,userLng,filteredsites[csF].lat,filteredsites[csF].lng);
					}

					if(category)
						category.sites = category.sites.concat(filteredsites);
					else{
						var catInfo = _.findWhere(userCategories,{identifier:foundSearchSites[c].categoryIdentifier});
						var category = {identifier:catInfo.identifier, name:catInfo.name, sites: filteredsites, hasSites:'1'};						
						categorySitesResult.categories.push(category);
						catAdded.push(foundSearchSites[c].categoryIdentifier);							
					}		
					category.sites=_.sortBy(category.sites, 'biinieProximity');				
					cantSites += filteredsites.length;
				}					
			}				
			callback(categorySitesResult,cantSites,catAdded);
		});
	}

	//PUT an update of an site
	functions.set=function(req,res){
		var model = req.body.model;		
		//Perform an update
		var organizationIdentifier=req.param("orgIdentifier");
		res.setHeader('Content-Type', 'application/json');

		//If is pushing a new model
		if(typeof(req.param("siteIdentifier"))==="undefined"){
			
			//Set the account and the user identifier
			var model = new site();
            model.identifier=utils.getGUID();
			model.accountIdentifier= req.user.accountIdentifier;
			model.isValid = false;

			//Get the Mayor and Update
			getMajor(organizationIdentifier,req.user.accountIdentifier,function(major){
				model.major =major;
				model.proximityUUID= process.env.DEFAULT_SYS_ENVIROMENT;
				organization.update(
					{
						identifier:organizationIdentifier, accountIdentifier: req.user.accountIdentifier
					},
					{
						$push: {sites:model}
					},
					function(err,raw){
						if(err){
							res.send(err, 500);
						}
							
						else{
							//Return the state and the object
							res.send(model, 201);
						}						
					}
				);				
			});
		}else{
			var updateSiteCategory=false;
			var updateSite=false;

			var doneFunction=function(){
				//Return the state
				if(updateSiteCategory& updateSite){
					console.log("Done process of: " + model.identifier);
					res.send(model,200);													
				}
					
			}			
			model.isValid = utils.validate(new site().validations(),req,'model')==null;
			if(model)
			{	
				delete model._id;				
				delete model.minorCounter;
				delete model.major;
				delete model.isDeleted;
				delete model.commentedCount;
				delete model.sharedCount;
				delete model.biinedCount;
				delete model.loyalty;
				//Remove the id of the new biins
				for(var b =0; b< model.biins.length; b++){
					if('isNew' in model.biins[b]){
						delete model.biins[b]._id;	
					}
				}				
				var set = {};

				for (var field in model) {
					if(field!="biins")	//Add a filter for prevent insert other biins without purchase
				  		set['sites.$.' + field] = model[field];
				}
				//Set sites categories
				setSiteCategory(true,model,model.identifier,function(cantAffected){
					updateSiteCategory =true;
					doneFunction();
				})									
				organization.update(
	                     { identifier:organizationIdentifier, accountIdentifier: req.user.accountIdentifier,'sites.identifier':model.identifier},
	                     { $set :set },
	                     { upsert : false },
	                     function(err, raw){
	                     	if(err){
	                     		throw err;
	                     		res.json(null);
	                     	}
							else{
								updateSite =true;
								doneFunction();
								/*if(model.region)
									regionRoutes.updateRegionSiteCategories(model.region,model.identifier,model.categories,function(succes){
										//Return the state
										res.send(model,200);							
									});
								else{
					
								}*/
	                            
							}
	                     }
	                   );

			}
		}				
	}	

	// Set the Site Category model
	var setSiteCategory = function(isUpdate,model,siteIdentifier,callback){
		var cantCategoriesAdded=0;

		//Site neighbors process
		var siteNeighborsProcess= function(siteIdentifier,lat,lng,callback){
			siteCategory.find({'sites.identifier':siteIdentifier},function(err,siteCategoryFound){
				if(err)
					throw err;
				else{
					var maxNeighboards=4;
					//Iterate over ther sitesCategorys and set the neighboards
					for(var i =0;i<siteCategoryFound.length;i++){						
						var sitesOrdered = _.sortBy(siteCategoryFound[i].sites, 'proximity');
						//Iterate over the site of the siteCategory
						for(var j=0;j<sitesOrdered.length;j++){							
							var siteToUpdate = sitesOrdered[j];
							var neighboards =[];
							var cantAdded =0;

							var prevNeighAdded=0;
							if(j>=2){

								neighboards.push({siteIdentifier:sitesOrdered[j-1].identifier,proximity: utils.getProximity(lat,lng,sitesOrdered[j-1].lat,sitesOrdered[j-1].lng)});
								neighboards.push({siteIdentifier:sitesOrdered[j-2].identifier,proximity: utils.getProximity(lat,lng,sitesOrdered[j-2].lat,sitesOrdered[j-2].lng)});
								prevNeighAdded=2;
								cantAdded+=2;								

							}else{

								if(j==1){
									neighboards.push({siteIdentifier:sitesOrdered[j-1].identifier,proximity: utils.getProximity(lat,lng,sitesOrdered[j-1].lat,sitesOrdered[j-1].lng)});
									cantAdded++;
									prevNeighAdded=1;
								}

							}

							var pointer = j+1;

							//Refill spaces
							if(sitesOrdered.length-1 > cantAdded){
								while(cantAdded<maxNeighboards && pointer< sitesOrdered.length){
									neighboards.push({siteIdentifier:sitesOrdered[pointer].identifier,proximity: utils.getProximity(lat,lng,sitesOrdered[pointer].lat,sitesOrdered[pointer].lng)})
									cantAdded++;										
									pointer++;
								}
							}
							//If the cant added is less than cant to add
							if(cantAdded< maxNeighboards && j-prevNeighAdded>0){
								var missingSpaces =maxNeighboards-cantAdded;
								var cantCanAdd = j-prevNeighAdded;
								if(j>missingSpaces)
									cantCanAdd= missingSpaces;
								
								for(var backNeigh=0;backNeigh<cantCanAdd;backNeigh++){
									pointer = j-backNeigh-prevNeighAdded-1;
									neighboards.push({siteIdentifier:sitesOrdered[pointer].identifier,proximity: utils.getProximity(lat,lng,sitesOrdered[pointer].lat,sitesOrdered[pointer].lng)})
								}
							}

							siteToUpdate.neighbors= neighboards;
						}

						siteCategoryFound[i].sites = sitesOrdered;						
						siteCategoryFound[i].save(function(err){
							if(err)
								throw err;
						});
					}	
				}

				callback();
			});
		}

		//Call back of Push Sites By Categories
		var endProcessPush=function(){
			siteNeighborsProcess(siteIdentifier,model.lat,model.lng,function(){
				callback(cantCategoriesAdded);
			})			
		}

		//Insert the Site Categories
		var pushSitesByCategories =function(siteCategoryConfig,categories, proximity,lat,lng){
			var totalCategories = categories.length-1;
			for(var c =0; c< categories.length;c++){
				siteCategoryConfig.categoryIdentifier = categories[c].identifier;
				siteCategory.update(siteCategoryConfig,{$push:{'sites': {'identifier':siteIdentifier,'lat':lat,'lng':lng,'proximity':proximity}}},{upsert:true},function(err,raw){
					if(err)
						throw err;
					else{
						cantCategoriesAdded++;

						//Call the end callback
						if(cantCategoriesAdded === totalCategories){
							endProcessPush();
						}
					}
				});
			}

			//Call the end callback
			if(cantCategoriesAdded === totalCategories){
				endProcessPush();
			}
		}

		//Get a region where is in the area
		var sitesCategoriesProcess=function(siteIdentifier){
			var lat = eval(model.lat);
			var lng = eval(model.lng);

			var queryMinLat ={min_latitude:{$lte:lat}};
			var queryMaxLat ={max_latitude:{$gte:lat}};
			var queryMinLng = {min_longitude:{$lte:lng}};
			var queryMaxLng = {max_longitude:{$gte:lng}};

			if(lat<0){
				queryMinLat ={min_latitude:{$gte:lat}};
				queryMaxLat ={max_latitude:{$lte:lat}};
			}
			if(lng<0){
				queryMinLng = {min_longitude:{$gte:lng}};
				queryMaxLng = {max_longitude:{$lte:lng}};
			}

			//Search if theres is a SiteCategory in the range			
			siteCategory.findOne({$and:[queryMinLat,queryMinLng,queryMaxLat,queryMaxLng]},function(err,data){
				//If there is a configuration in range
				if(data){

					var defConfiguration = {min_latitude: data.min_latitude, min_longitude:data.min_longitude,max_latitude:data.max_latitude, max_longitude:data.max_longitude,radious:data.radious};
				 	
				 	var resultLat = model.lat -  data.min_latitude ;				 	
				 	var resultLong = model.lng - data.min_longitude;

				 	var radiansProximity= math.sqrt((resultLat*resultLat) + (resultLong*resultLong));
				 	var metersProximity=((radiansProximity*1000)/360)*process.env.EARTH_CIRCUMFERENCE;
					//Push the categories of the sites					
					pushSitesByCategories(defConfiguration,model.categories,metersProximity,model.lat,model.lng);
				}else{
					
					var radiousRadians = ((process.env.STANDARD_RADIOUS/1000)*360)/process.env.EARTH_CIRCUMFERENCE/2;
					var minLat = model.lat>0?eval(model.lat)-radiousRadians:eval(model.lat)+radiousRadians;
					var minLng = model.lng>0?eval(model.lng)-radiousRadians:eval(model.lng)+radiousRadians;
					var maxLat = model.lat>0?eval(model.lat)+radiousRadians:eval(model.lat)-radiousRadians;
					var maxLng = model.lng>0?eval(model.lng)+ radiousRadians:eval(model.lng)-radiousRadians;

					var metersProximity =((radiousRadians*1000)/360)*process.env.EARTH_CIRCUMFERENCE;
					var defConfiguration = {min_latitude: minLat, min_longitude:minLng,max_latitude:maxLat, max_longitude:maxLng,radious:radiousRadians};
					
					//Push the categories of the sites					
					pushSitesByCategories(defConfiguration,model.categories,metersProximity,model.lat,model.lng);
				}

			});
		}

		//Check if a Site has Biins associated
		var checkIfBiinHasSites=function(siteIdentifier,callback){
			biin.findOne({siteIdentifier:siteIdentifier, status:'Installed'},{identifier:1},function(err,foundBiin){
				if(err)
					throw err;
				else
					var hasBiins = foundBiin?true:false;
					callback(hasBiins);
			});
		}

		if(isUpdate){
				//Remove the Site in the siteCategory Schema
				siteCategory.update({"sites.identifier":siteIdentifier}, {$pull: {"sites":{'identifier':siteIdentifier}}},{multi: true},function(err,raw){
				if(err)
					throw err;
				else{
					checkIfBiinHasSites(siteIdentifier,function(hasBiins){
						if(hasBiins)
							sitesCategoriesProcess(siteIdentifier);
						else
							callback(0);
					});
				}
					
			});
		}else{
			checkIfBiinHasSites(siteIdentifier,function(hasBiins){
				if(hasBiins)
					sitesCategoriesProcess(siteIdentifier);
				else
					callback(0);
			})
		}
	}

	//Set Site category Public Method
	functions.setSiteCategory = setSiteCategory;

	//DELETE an specific site
	functions.delete= function(req,res){
		//Perform an update
		var organizationIdentifier=req.param("orgIdentifier");
		var siteIdentifier=req.param("siteIdentifier");

		regionRoutes.removeSiteToRegionBySite(siteIdentifier,function(){
			organization.update({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},{$pull:{sites:{identifier:siteIdentifier}}},function(err){
						if(err)
							throw err;
						else
							res.json({state:"success"});
					});			
		})
		
	}

	//PUT Purchase a Biin to a Site
	functions.biinPurchase = function(req,res){
		var organizationIdentifier=req.param("orgIdentifier");
		var siteIdentifier=req.param("siteIdentifier");
		var qty= eval(req.body['biinsQty']);
		var isBasicPackage= eval(req.body['isBasicPackage']);
		if(isBasicPackage)
			qty=2;
		res.setHeader('Content-Type', 'application/json');

		if((qty || isBasicPackage) && organizationIdentifier && siteIdentifier){
			var newMinorValue = utils.get.minorIncrement() *qty;
			organization.findOne({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier,'sites.identifier': siteIdentifier},{'_id':1,'sites.$':1},function(err, siteInfo){
				if(err)
					res.send(err,500)					
				else
				{
					var minor = 0;
					var major=0;
					if(siteInfo.sites[0]){
						minor =siteInfo.sites[0].minorCounter;
						major= siteInfo.sites[0].major;
					}

					//Todo the process of the deduction of the Credit Card
					var historyRecord ={} ;			
					historyRecord.date=utils.getDateNow(); historyRecord.quantity=qty; historyRecord.site=siteIdentifier;

					//Add an history record
					organization.update({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},{$push:{purchasedBiinsHist:{$each:[historyRecord]}}},{upsert:false},function(err,raw){
						if(err){
							res.send(err,500)
						}else{
							newMinorValue += eval(minor);
							var newBeacons =[];
							var dateNow = utils.getDateNow();
							var cantMinorToInc = utils.get.minorIncrement() ;							
							var minorIncrement =minor;

							//Create the new Beacons
 							for(var i=0; i<qty;i++){
 								var biinIdentifier = utils.getGUID();
 								minorIncrement+=cantMinorToInc; 								
 								var biintype=1; 								
 								if(isBasicPackage)
 									biintype=(i%2)+1;
 								newBeacons.push(new biin({identifier:biinIdentifier,registerDate:dateNow,proximityUUID:organizationIdentifier, major:major,minor:minorIncrement, isRequiredBiin:isBasicPackage,biinType:biintype}));	
 							}
 							newMinorValue=0;
 							//Organization Update
							organization.update({'_id':siteInfo._id,"sites._id":siteInfo.sites[0]._id},{$push:{"sites.$.biins":{$each:newBeacons}},$set:{"sites.$.minorCounter":newMinorValue}},function(err,raw){
								if(err)
									res.send(err,500)
								else{
									res.send(newBeacons,201);
								}
							});
						}

					});					
				}
					
			});

		}
	}

	//Post add Site to a region
	functions.addSiteToRegion =function(req,res){
		var orgIdentifier = req.param('orgIdentifier');
		var siteIdentifier= req.param('siteIdentifier')

		var addSiteLogic = function(siteObj){
			addSiteToRegion(siteObj,function(result,regionId){							
				if(result){
					organization.update({'identifier':orgIdentifier,'sites.identifier':siteObj.identifier},{$set:{'sites.$.region':regionId}},function(err,raw){
						if(!err && raw.n>0)	
							res.json({status:0, data: regionId})
						else
							res.json({status:5})
					});

					
				}else{
					res.json({status:5})
				}

			})
		}

		organization.findOne({identifier:orgIdentifier, "sites.identifier":siteIdentifier},{"sites.$":1},function(err,foundSite){
			if(err)
				throw err;
			else{
				if(foundSite && foundSite.sites){
					if(foundSite.sites[0].region===''){
						addSiteLogic(foundSite.sites[0])
					}else{
						console.log("Updating the site region");
						//Unsubscribe the site to the region
						regionRoutes.removeSiteToRegionBySite(siteIdentifier,function(){
							addSiteLogic(foundSite.sites[0]);
						})
					}
				}
			}
		})
	}	

	//Function to add a site inside a region.
	addSiteToRegion =function(site,callback){

		//Verify the  closest region
		regionRoutes.getRegionByProximity(site.lat,site.lng,function(isInside,region){
			//If is inside a region
			if(isInside){
				regionRoutes.addSiteToRegion(region.identifier,{identifier:site.identifier},function(wasAdded,regionId){
					if(wasAdded){
						callback(true,region.identifier);
					}
					else{
						callback(false,null);
					}
				});
			}else{
				//If is not inside a region
				regionRoutes.createRegion(site.lat,site.lng,{identifier:site.identifier},function(wasAdded,region){
					if(wasAdded){
						callback(true,region);
					}else{
						callback(false,null);
					}
				})
			}


		});
	}
	
	//Minor and major Functions

	//GET the major of the enviroment
	getMajor =  function(organizationIdentifier,accountIdentifier, callback){

		//Get the mayor from the enviroment	and return it
		//TODO: Get enviroment by Site configuration
		var enviroment = process.env.DEFAULT_SYS_ENVIROMENT;

		sysGlobalsRoutes.incrementMajor(enviroment,function(major){
			callback(major);
		})
	}

	//Test and other Utils
	functions.setSitesValid= function(req,res){
		var processed =0;
		organization.find({'sites.isValid':{ $exists: false }},{"identifier":1,"sites":1},function(err,data){
			var orgCant = data.length;
			for(var o =0; o<data.length;o++){
				var organization = data[o];
				for(var s=0; s<data[o].sites.length;s++){
					req.body.model = organization.sites[s];
					var errors =  utils.validate(new site().validations(),req,'model');
					console.log(errors);
					data[o].sites.isValid = errors===null;	
					console.log('Is site valid: '+ data[o].sites.isValid);
				}

				organization.save(function(err){
					processed++;
					if(err)
						throw err;
					else
						console.log("save changes in org: " + organization.identifier)

					if(processed ===orgCant)
						res.json({status:0});
				})
			}

		})    	
    }
    
	return functions;
}
