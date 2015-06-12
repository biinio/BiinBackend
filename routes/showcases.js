module.exports = function () {
    //Packages
    var moment = require('moment');

    //Custom Utils
  	var imageManager = require("../biin_modules/imageManager")(),
  	    utils = require('../biin_modules/utils')(),
  	    routesUtils = require('../biin_modules/routesUtils')();

	//Schemas
	var organization = require('../schemas/organization');
	var showcase = require('../schemas/showcase');
	var region = require('../schemas/region');
	var functions = {};


	//GET the index view of a showcases
	functions.index = function(req,res){
		var organization = req.param("identifier");

		var callback= function(organization,req, res){
			res.render('showcase/index', { title: 'Organizations list' ,user:req.user, organization:organization, isSiteManteinance:true});
		}

		routesUtils.getOrganization(req.param("identifier"),req,res,{name:true, identifier:true},callback)			 
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
	         newModel.notifications = [{isActive:"0",notificationType:'1',text:''}];
	         newModel.startTime="2015-03-26T06:00:35.001Z";
	         newModel.endTime="2015-03-26T06:00:35.001Z";
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

		var updateLinkingReferences=function(callback){
			//Update the showcases inside the biins references.
			organization.findOne({identifier:organizationIdentifier,'sites.showcases.showcaseIdentifier':showcaseIdentifier},function(err,orgData){
				if(orgData && orgData.sites && orgData.sites.length){
					for(var i=0; i<orgData.sites.length;i++){
						if('showcases' in orgData.sites[i] && orgData.sites[i].showcases.length){
							var toSpliceIndex=[];
							for(var s =0; s<orgData.sites[i].showcases.length;s++){
								if(orgData.sites[i].showcases[s].showcaseIdentifier===showcaseIdentifier){
									toSpliceIndex.push(s);
								}
							}
							//Remove the Index
							if(toSpliceIndex.length>0){
								for(var index=0;index<toSpliceIndex.length;index++)
									orgData.sites[i].showcases.splice(toSpliceIndex[index],1);
							}
						}
					}
				}
				orgData.save(function(err){
					if(err)
						throw err;
					else{						
						callback();
					}
				})
			});
		}

		showcase.remove({identifier:showcaseIdentifier,accountIdentifier: req.user.accountIdentifier, organizationIdentifier:organizationIdentifier},function(err){
			if(err)
				throw err;
			else
				updateLinkingReferences(function(){
					res.json({state:"success"});
				});	
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

	//Get a specific showcase
	functions.getMobileShowcase =function(req,res){
		var identifier = req.param("identifier");
		//biinie getShowcase
		showcase.findOne({"identifier":identifier},{"identifier":1,"showcaseType":1,"name":1,"description":1,"titleColor":1,"lastUpdate":1,"elements.elementIdentifier":1,"elements._id":1, "notifications":1, "webAvailable":1},function(err,data){
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
					showcaseObj.notifications = data.notifications;
					showcaseObj.activateNotification = data.activateNotification?data.activateNotification:"0";					
					showcaseObj.webAvailable = data.webAvailable;
					showcaseObj.showcaseType = data.showcaseType?data.showcaseType:"1";
					showcaseObj.elements = data.elements;					

					res.json({data:showcaseObj,status:"0"});
				}
		})

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