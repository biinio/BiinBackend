module.exports = function () {
    //Packages
    var moment = require('moment');

    //Custom Utils
  	var imageManager = require("../biin_modules/imageManager")(),
  	    utils = require('../biin_modules/utils')();

	//Schemas
	var showcase = require('../schemas/showcase');
	var region = require('../schemas/region');
	var functions = {};


	//GET the index view of a showcases
	functions.index = function(req,res){
		var organization = req.param("identifier");

		var callback= function(organization,req, res){
			res.render('showcase/index', { title: 'Organizations list' ,user:req.user, organization:organization, isSiteManteinance:true});
		}

		//If the organization header is not in cache try to get it
		//if(!req.session.selectedOrganization || req.session.selectedOrganization.identifier!= organizationId){			
			 getOganization(req, res, callback);
	}

	//GET the list of showcases
	functions.list = function(req,res){
		var organizationIdentifier = req.param("identifier");
		var showcaseProto = new showcase();
		showcaseProto.organizationIdentifier = organizationIdentifier;
		showcase.find({accountIdentifier:req.user.accountIdentifier, organizationIdentifier:organizationIdentifier},function (err, data) {
			   res.json({data:data, prototypeObj : showcaseProto});
		});		
	}

	//GET a showcase By Id
	functions.get=function(req,res){
		var organizationIdentifier = req.param("organizationId");
		var showcaseIdentifier = req.param("identifier");

   		showcase.findOne({"organizationIdentifier":organizationIdentifier,"identifier":showcaseIdentifier},'',function(err,data){
   			if(data){
   				res.json({data:{showcase:data}});
   			}   				
   			else
   				res.json(null);
   		});
	}

	//POST/PUT an update of the showcase
	functions.set=function(req,res){

		//Perform an update
		var organizationIdentifier= req.param('identifier');
		var showcaseIdentifier=req.param("showcase");

		//If is a new element
		if(typeof(showcaseIdentifier)==="undefined"){

	         var newModel  = new showcase();
	         newModel.identifier=utils.getGUID();
	         newModel.accountIdentifier = req.user.accountIdentifier;
	         newModel.organizationIdentifier = organizationIdentifier;		      
	         newModel.lastUpdate =  utils.getDateNow();

	         newModel.save(function(err){
	         	if(err)
	         		res.send(err,500);
	         	else
					res.send(newModel,201);
	         	});
		}else
		{
			var model = req.body.model;	
			model.lastUpdate = utils.getDateNow();	
			if(model)	
				delete model._id;		

			//Update the showcase information
			showcase.update(
                     {
                       identifier:showcaseIdentifier,
                     	organizationIdentifier:model.organizationIdentifier, 
                     	accountIdentifier:req.user.accountIdentifier
                     },
                     { $set :model },
                     { upsert : true },
                     function(err){
                     	
                     	if(err)
							res.json(null);
						else{
							//Update the biins last update property asynchronous
                            updateBiinsLastUpdate(showcaseIdentifier);
                            //Return the state
							res.json({state:'success'});							
						}
                     }
             );
		}						
	}

	//DELETE an specific showcase
	functions.delete= function(req,res){

		//Perform a delete
		var organizationIdentifier = req.param('identifier');
		var showcaseIdentifier=req.param("showcase");
		showcase.remove({identifier:showcaseIdentifier,accountIdentifier: req.user.accountIdentifier, organizationIdentifier:organizationIdentifier},function(err){
			if(err)
				throw err;
			else
				res.json({state:"success"});
		});
	}

	//GET the list of showcases by Biin ID
	functions.getByBiin=function(req,res){
		var biinIdentifier = req.param("biin");
		region.findOne({"biins.identifier":biinIdentifier},{"biins.$.showcaseIdentifier":1},function (err, data) {
					   if(data){
					   		var showcaseParam=data.biins[0].showcaseIdentifier.toString();
					   		showcase.findOne({"identifier":showcaseParam},'',function(err,dataShowCase){
					   			res.json({data:dataShowCase});
					   		});
					   	}else
					   		res.json(null);	   
				});	
	}

	//Get generate an Id for a showcase
	functions.getShowcaseId= function(req,res){
		res.json({data:utils.getGUID()});
	}

	//POST an image for a showcase
	functions.imagePost=function(req,res,next){	
		imageManager.upload(req.headers.origin,req.files.img.path,req.files.img.name,function(err,data){
			if(err)
				throw err;
			else
				res.json(JSON.stringify(data));
		});
	}

	//POST image crop
	functions.imageCrop=function(req,res,next){
		try
		{			
			imageManager.cropImage(process.env.SHOWCASE_PIXEL_EQ,"showcase",req.body.imgUrl,req.body.imgW,req.body.imgH,req.body.cropW,req.body.cropH,req.body.imgX1,req.body.imgY1,function(err,data){
				if (err) throw err;
				else					
					res.json(JSON.stringify(data));	
			});
	  	}
		catch(err){
		  	console.log(err);
		}
	}

	/****
	 Other methods
	***/

	getOganization = function(req, res, callback){
		var identifier=req.param("identifier");

		organization.findOne({"accountIdentifier":req.user.accountIdentifier,"identifier":identifier},{sites:true, name:true, identifier:true},function (err, data) {
			req.session.selectedOrganization = data;
			callback(data,req,res);
		});
	}

	//Update Biins Last Update in Regions
    function updateBiinsLastUpdate(showcaseId){
      	var updateDate = moment().format('YYYY-MM-DD h:mm:ss');
      	region.find({"biins.showcaseIdentifier":showcaseId},"",function(err,data){
      		if(err)
      			throw err
      		else
      			if(data){
      			  //Iterate over the regions
      		      for(var i=0;i<data.length; i++){
                      //Iterate over the biins
                      var lengthOfBiins = data[i].biins.length;
                      for(var j=0;j < lengthOfBiins;j++){
                          if(data[i].biins[j].showcaseIdentifier===showcaseId){
                          	data[i].biins[j].lastUpdate = updateDate;
                          }
                      }
                      var objectId = data[i]._id;
                      var model =  JSON.parse(JSON.stringify(data[i]));;
                      delete model._id;
                      //For each regions set the update
                      region.update({ _id:objectId},
                                    { $set :model },
                                    { upsert : true },
                                    function(err){
                                    	if(err)
                                    		throw err;
                                    });
      		      }
      		    }
      	});
    }

	return functions;
}