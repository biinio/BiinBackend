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
		var model =req.body.model;
		
		//Perform an update
		var organizationIdentifier=req.param("orgIdentifier");
		var model = req.body.model;			
		delete model._id;
		
		//Remove the id of the new biins
		for(var b =0; b< model.biins.length; b++){
			if('isNew' in model.biins[b]){
				delete model.biins[b]._id;	
			}
		}

		if(model)
		{			
			//If is pushing a new model
			if('isNew' in model){
				delete model.isNew;

				//Set the account and the user identifier
                model.identifier=utils.getGUID();
				model.accountIdentifier= req.user.accountIdentifier;
				organization.update(
					{
						identifier:organizationIdentifier, accountIdentifier: req.user.accountIdentifier
					},
					{
						$push: {sites:model}
					},
					function(err,affectedRows){
						if(err)
							throw err;
						else{

							//Return the state and the object
							res.json({state:"success",replaceModel:model});
						}						
					}
				);

			}else{

				var set = {};

				for (var field in model) {
				  set['sites.$.' + field] = model[field];
				}
				organization.update(
	                     { identifier:organizationIdentifier, accountIdentifier: req.user.accountIdentifier,'sites.identifier':model.identifier},
	                     { $set :set },
	                     { upsert : true },
	                     function(err, cantAffected){
	                     	if(err){
	                     		throw err;
	                     		res.json(null);
	                     	}
							else{
	                            //Return the state
								res.json({state:'success',replaceModel:model});							
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
		organization.update({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},{$pull:{sites:{identifier:siteIdentifier}}},function(err){
			if(err)
				throw err;
			else
				res.json({state:"success"});
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
