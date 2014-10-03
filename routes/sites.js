module.exports = function () {
	//Custom Utils
	var utils = require('../biin_modules/utils')();
	var util = require('util');

	//Schemas
	var organization = require('../schemas/organization'),  site = require('../schemas/site'),
					   biin = require('../schemas/biin');

	var functions={};

	//GET the main view of sites
	functions.index = function(req,res){

		var organizationId =req.param("identifier");

		var callback= function(organization,req, res){
			res.render('site/index', { title: 'Sites list' , user:req.user, organization:organization, isSiteManteinance:true});
		}

		//If the organization header is not in cache try to get it
		//if(!req.session.selectedOrganization || req.session.selectedOrganization.identifier!= organizationId){			
			 getOganization(req, res, callback);
		/*}else{
			callback(req.session.selectedOrganization,req,res);
		}*/
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
		

		/*if(!req.session.selectedOrganization || req.session.selectedOrganization.identifier!= organizationId){		
			getOganization(req, res, callback);				  	
	  	}
		else
		{
			callback(req.session.selectedOrganization.sites, req,res)
		}
		*/
	}

	//PUT an update of an site
	functions.set=function(req,res){
		//Perform an update
		var organizationIdentifier=req.param("orgIdentifier");
		res.setHeader('Content-Type', 'application/json');

		//If is pushing a new model
		if(typeof(req.param("siteIdentifier"))==="undefined"){
			
			//Set the account and the user identifier
			var model = new site();
            model.identifier=utils.getGUID();
			model.accountIdentifier= req.user.accountIdentifier;

			//Get the Mayor and Update
			getMajor(organizationIdentifier,req.user.accountIdentifier,function(major){
				model.major =major;
				organization.update(
					{
						identifier:organizationIdentifier, accountIdentifier: req.user.accountIdentifier
					},
					{
						$push: {sites:model}
					},
					function(err,affectedRows){
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
			var model = req.body.model;		
			if(model)
			{	
				delete model._id;
				
				//Remove the id of the new biins
				for(var b =0; b< model.biins.length; b++){
					if('isNew' in model.biins[b]){
						delete model.biins[b]._id;	
					}
				}				
				var set = {};

				for (var field in model) {
					if(field!="biins")	//Add a filter for prevent inser other biins without purchase
				  		set['sites.$.' + field] = model[field];
				}
				organization.update(
	                     { identifier:organizationIdentifier, accountIdentifier: req.user.accountIdentifier,'sites.identifier':model.identifier},
	                     { $set :set },
	                     { upsert : false },
	                     function(err, cantAffected){
	                     	if(err){
	                     		throw err;
	                     		res.json(null);
	                     	}
							else{
	                            //Return the state
								res.send(model,200);							
							}
	                     }
	                   );
			}
		}				
	}	

	//DELETE an specific site
	functions.delete= function(req,res){
		//Perform an update
		var organizationIdentifier=req.param("orgIdentifier");
		var siteIdentifier=req.param("siteIdentifier");
		//Update the purchase history
		var history ={}
		organization.update({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},{$pull:{sites:{identifier:siteIdentifier}}},function(err){
			if(err)
				throw err;
			else
				res.json({state:"success"});
		});
	}

	//PUT Purchase a Biin to a Site
	functions.biinPurchase = function(req,res){
		var organizationIdentifier=req.param("orgIdentifier");
		var siteIdentifier=req.param("siteIdentifier");
		var qty= eval(req.body['biinsQty']);
		res.setHeader('Content-Type', 'application/json');

		if(qty && organizationIdentifier && siteIdentifier){
			var newMinorValue = utils.get.minorIncrement() *qty;
			organization.findOne({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier,'sites.identifier': siteIdentifier},{_id:false,'sites.$':true},function(err, siteInfo){
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

					//To Do the process of the deduccion in the Credit Card
					var historyRecord ={} ;			
					historyRecord.date=utils.getDateNow(); historyRecord.quantity=qty; historyRecord.site=siteIdentifier;

					//Add an history record
					organization.update({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},{$push:{purchasedBiinsHist:{$each:[historyRecord]}}},{upsert:false},function(err,data){
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
 								minorIncrement+=cantMinorToInc;
 								newBeacons.push(new biin({registerDate:dateNow,proximityUUID:organizationIdentifier, major:major,minor:minorIncrement}));
 							}

 							//Organization Update
							organization.update({"accountIdentifier":req.user.accountIdentifier,"identifier":organizationIdentifier,"sites.identifier":siteIdentifier},{$push:{"sites.$.biins":{$each:newBeacons}},$set:{"sites.$.minorCounter":newMinorValue}},function(err,data){
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

	//Minor and major Functions

	//GET the major of the organization
	getMajor =  function(organizationIdentifier,accountIdentifier, callback){
		organization.findOne({identifier:organizationIdentifier, accountIdentifier:accountIdentifier},'majorCounter',function(err, data){
			organization.update({identifier:organizationIdentifier, accountIdentifier:accountIdentifier}, {$inc:{majorCounter:utils.get.majorIncrement()}},function(err){
				if(err)
					throw err;
				else
					callback(data.majorCounter);

			});
		});
	}
	
	//Other methods
	getOganization = function(req, res, callback){
		var identifier=req.param("identifier");

		organization.findOne({"accountIdentifier":req.user.accountIdentifier,"identifier":identifier},{sites:true, name:true, identifier:true, pointers:true},function (err, data) {

			if(err){
				throw err;
			}

			req.session.selectedOrganization = data;
			callback(data,req,res);
		});
	}


	return functions;
}
