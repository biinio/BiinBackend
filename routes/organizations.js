module.exports =function(db){

	//Custom Utils
	var utils = require('../biin_modules/utils')();

	//Schemas
	var organization = require('../schemas/organization');

	var functions ={};

	functions.index = function(req,res){
		res.render('organization/index', { title: 'Organizations list' ,user:req.user});
	}	

	//GET the list of organizations
	functions.list = function(req,res){		
		organization.find({"accountIdentifier":req.user.accountIdentifier},function (err, data) {
			   res.json({data:data, prototypeObj : new organization()});
		});		
	}

	//PUT an update of the showcase
	functions.set=function(req,res){	 
		var model =req.body.model;
		//Perform an update
		var organizationIdentifier=req.param("identifier");
		var model = req.body.model;			
		delete model._id;

		if(model)
		{
			//If is pushing a new model
			if('isNew' in model){

				delete model.isNew;
                
                var newModel = new organization(model);
				//Set the account and de user identifier
                newModel.identifier=utils.getGUID();
				newModel.accountIdentifier= req.user.accountIdentifier;

				console.log("model to save: "+newModel);
				//Perform an create
				newModel.save(function(err){
					if(err)
						throw err;
					else{
						//Return the state and the object
						res.json({state:"success",replaceModel:model});
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
								res.json({state:'success'});							
							}
	                     }
	                   );
			}
		}
	}

		//DELETE an specific showcase
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


	return functions;
}