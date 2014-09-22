module.exports =function(db){

	//Custom Utils
	var utils = require('../biin_modules/utils')(), awsManager= require('../biin_modules/awsManager')(), path = require('path');

	//Schemas
	var organization = require('../schemas/organization'), site = require('../schemas/site');
	var functions ={};

	//GET the Main view of an Organization
	functions.index = function(req,res){
		res.render('organization/index', { title: 'Organizations list' ,user:req.user});
	}	

	//GET the list of organizations
	functions.list = function(req,res){		
		organization.find({"accountIdentifier":req.user.accountIdentifier},function (err, data) {
			   res.json({data:data, prototypeObj : new organization()});
		});		
	}

	//PUT an update of the organization
	functions.set=function(req,res){	 
		var model =req.body.model;
		//Perform an update
		var organizationIdentifier=req.param("identifier");
		var model = req.body.model;			
		delete model._id;

		//Validate the model
		
		if(model)
		{			
			//If is pushing a new model
			if('isNew' in model){

				delete model.isNew;
                
                var newModel = new organization(model);
                organizationIdentifier = utils.getGUID();

				//Set the account and de user identifier
                newModel.identifier=organizationIdentifier
				newModel.accountIdentifier= req.user.accountIdentifier;
				
				//Perform an create
				newModel.save(function(err){
					if(err)
						throw err;
					else{
							//Return the state and the object
							res.json({state:"success",replaceModel:newModel});
					}
				});
				
			}else{
				organization.update(
	                     { identifier:organizationIdentifier},
	                     { $set :model },
	                     { upsert : true },
	                     function(err){
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

	//DELETE an specific Organization
	functions.delete= function(req,res){
		//Perform an update
		var organizationIdentifier=req.param("identifier");
		organization.remove({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},function(err){
			if(err)
				throw err;
			else
				res.json({state:"success"});
		});
	}

	//Minor and major Functions

	//GET the major of the organization
	functions.getMajor =  function(req,res){
		var organizationIdentifier = req.param('identifier');
		organization.findOne({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},'majorCounter',function(err, data){
			organization.update({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier}, {$inc:{majorCounter:utils.get.majorIncrement()}},function(err){
				if(err)
					throw err;
				else
					res.json({data: data.majorCounter});

			});
		});
	}

	//GET the minor of the organization context
	functions.getMinor =  function(req,res){
		var organizationIdentifier = req.param('identifier');
		var siteIdentifier = req.param('siteIdentifier');
		organization.findOne({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier,'sites.identifier': siteIdentifier},'sites.$.minorCounter',function(err, data){
			//If the site is not new
			if(data){
				organization.update({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier,'sites.identifier': siteIdentifier}, {$inc:{'sites.$.minorCounter':utils.get.minorIncrement()}},function(err, count){
					if(err)
						throw err;
					else{

						var minor = 0;
						if(data.sites[0].minorCounter)
							minor =data.sites[0].minorCounter;

						res.json({data:minor});
					}
				});				
			}else
				//Return the increment variable
				res.json({data:utils.get.minorIncrement()});
		});
	}

	return functions;
}