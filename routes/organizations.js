module.exports =function (){

	//Common Libraries
	var util = require('util'), fs=require('fs');

	//Custom Utils
	var utils = require('../biin_modules/utils')(), awsManager= require('../biin_modules/awsManager')(), path = require('path'),imageManager=require('../biin_modules/imageManager')();
	
	//Schemas	
	var organization = require('../schemas/organization'), site = require('../schemas/site'), showcase = require('../schemas/showcase'), client = require('../schemas/client');;

	//Other Routes
	var regionRoutes = require('./regions')(),  elementRoutes = require('./elements')();

	var functions ={};

	//GET the Main view of an Organization
	functions.index = function(req,res){
		res.render('organization/index', { title: 'Organizations list' ,user:req.user});
	}	

	//GET the list of organizations
	functions.list = function(req,res){	
		res.setHeader('Content-Type', 'application/json');	
		organization.find({"accountIdentifier":req.user.accountIdentifier},{_id:0,identifier:1,name:1,brand:1,description:1,extraInfo:1,media:1},function (err, data) {
			   res.json({data:data});
		});		
	}

	//PUT/POST an organization
	functions.set=function(req,res){
	//Perform an update
		var organizationIdentifier=req.param("identifier");
		res.setHeader('Content-Type', 'application/json');

		//If is pushing a new model
		if(typeof(organizationIdentifier)==="undefined"){
	        var newModel = new organization();
	        organizationIdentifier = utils.getGUID();

			//Set the account and de user identifier
	        newModel.identifier=organizationIdentifier
			newModel.accountIdentifier= req.user.accountIdentifier;
			
			//Perform an create
			newModel.save(function(err){
				if(err)
					res.send(err, 500);
				else{
					//Return the state and the object
					res.send(newModel, 201);
				}
			});			
		}else{
			var model = req.body.model;			
			delete model._id;

			//Validate the Model
			/*

			var errors =utils.validate(new organization().validations(),req,'model');
			if(errors)
				res.send(errors,400);
			else
			*/
			delete model.identifier;
			organization.update(
			                     { identifier:organizationIdentifier},
			                     { $set :model },
			                     { upsert : false },
			                     function(err){
			                     	if(err)
										res.send(err, 500);
									else
			                            //Return the state
										res.send(model,200);							
			                     }
			                   );					
		}		
	}

	//Set showcases into sites in a organization
	functions.setShowcasesPerSite = function(req, res){
		var organizationIdentifier =req.param("identifier");
		var model = req.body.model;	

		organization.findOne({identifier:organizationIdentifier},{_id:true, 'sites._id':true,'sites.showcases':true}, function(err, data){
			for (var i = 0; i < data.sites.length ; i++) {
					data.sites[i].showcases = model.sites[i].showcases;
			}
			data.save(
				function(err){
					if(err)
						res.send(err,500);
					else
						res.send(model,200);
				})
		});
	}



	//Post the Image of the Organization
	functions.uploadImage = function(req,res){
		//Read the file
		var userAccount = req.user.accountIdentifier;
		var userIdentifier = req.user.name;
		var organizationIdentifier =req.param("identifier");
		res.setHeader('Content-Type', 'application/json');

 		if(!util.isArray(req.files.file)){

 			var file =req.files.file;

	 		//var data = fs.readFileSync(file.path);
	 		var imagesDirectory = userAccount;
	 		var systemImageName = 'media/'+ userAccount+"/" +organizationIdentifier+"/media/img."+ utils.getExtension(file.originalFilename);	 			 			
 			imageManager.uploadFile(file.path,imagesDirectory,systemImageName,false,function(imgURL){
				var mediaObj={imgUrl:imgURL};

	 			organization.update({identifier:organizationIdentifier },{media:mediaObj},function(err){
	 				if(err)
	 					res.send(err, 500);
	 				else
	 				{
	 					res.json({data:mediaObj});	
	 				}
	 			});
 			
 			});	

 		} else{
 			res.send(err, 500);
 		}
	 }		

	//DELETE an specific Organization
	functions.delete= function(req,res){
		
		//Get the organization identifier
		var organizationIdentifier=req.param("identifier");

		if(req.session.defaultOrganization.identifier === organizationIdentifier){
			req.session.defaultOrganization={};

			client.update({name:req.user.name},{defaultOrganization:''},function(err){
				if(err)
					res.send({status:500});
				else{
					req.session.defaultOrganization=null;
					req.user.defaultOrganization =null;					
				}
			});	

		}

		organization.findOne({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},function(err,data){
			//Remove Sites and References
			for(var s=0; s<data.sites.length;s++){
				var removeSite = regionRoutes.removeSiteToRegionBySite(data.sites[s].identifier,function(){});
			}


			//Remove the showcases references
			showcase.remove({'organizationIdentifier':organizationIdentifier},function(err,affected){
				if(err)	
					throw err;
				else
				{
					//Remove the organization
					organization.remove({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},function(err){
						if(err)
							throw err;
						else
							res.json({state:"success"});
					});								
				}
			});

			
		});		
	}

	//Minor and major Functions

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