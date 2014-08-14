module.exports = function(){
	var functions ={};
	var element = require('../schemas/element'), showcase = require('../schemas/showcase'), organization= require('../schemas/organization');
	var imageManager = require("../biin_modules/imageManager")(), utils = require('../biin_modules/utils')();
	//Get the index view of the elements
	functions.index = function(req,res){
		var callback= function(organization,req, res){
			res.render('element/index', { title: 'Elements List' ,user:req.user, organization:organization, isSiteManteinance:true});
		}
		getOganization(req, res, callback);	
	}

	//GET the list of elements
	functions.list = function(req,res){
		var organizationIdentifier = req.param('identifier');
		element.find({accountIdentifier:req.user.accountIdentifier, organizationIdentifier:organizationIdentifier},function (err, data) {
			   res.json({data:data, prototypeObj : new element()});
		});		
	}

	//PUT an update of the showcase
	functions.set=function(req,res){
		var model =req.body.model;
		//Perform an update
		var organizationIdentifier= req.param('identifier');
		var elementIdentifier=req.param("element");	
		delete model._id;   	   
		if(model){
			if('isNew' in model){
			 delete model.isNew;
       
             var newModel  = new element(model);

             newModel.objectIdentifier=utils.getGUID();
             newModel.accountIdentifier = req.user.accountIdentifier;
             newModel.organizationIdentifier = organizationIdentifier;
             
             //Perform an create
             newModel.save(function(err){
             	if(err)
             		throw err;
             	else
             		res.json({state:"success",replaceModel:model});
             });
			}
			else{
				//Update the model
				updateElementsInShowcases(model,elementIdentifier,function(){
					element.update({accountIdentifier:req.user.accountIdentifier, organizationIdentifier:organizationIdentifier,"objectIdentifier":elementIdentifier},{$set:model},function(err,data){
								if(err)
									throw err; 
					 });
				});
			}
		}
	}

	//DELETE an specific showcase
	functions.delete= function(req,res){
		//Perform an update
		var organizationIdentifier = req.param('identifier');
		var elementIdentifier=req.param("element");
		removeElementsInShowcases(elementIdentifier,function(){
			//Remove the element
			element.remove({accountIdentifier:req.user.accountIdentifier,organizationIdentifier:organizationIdentifier,objectIdentifier:elementIdentifier},function(err){
						if(err)
							throw err;
						else
							res.json({state:"success"});
					});
		});		
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
			imageManager.cropImage("element",req.body.imgUrl,req.body.imgW,req.body.imgH,req.body.cropW,req.body.cropH,req.body.imgX1,req.body.imgY1,function(err,data){
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
    	****/

    //Update elements in showcases
    function updateElementsInShowcases(model,elementId,callback){
	    	showcase.find({"objects.objectIdentifier":elementId},"",function(err,data){
				if(err){
					throw err;    		
				}
				else{
					for(var i=0; i<data.length;i++){
						showcase.update({"identifier":data[i].identifier,"objects.objectIdentifier":elementId},
						{$set:{"objects.$.objectType":model.objectType,
							    "objects.$.likes":model.likes,
								"objects.$.title1":model.title1,
								"objects.$.title1Color":model.title1Color,								
								"objects.$.title2Color":model.title2Color,
								"objects.$.title1Size":model.title1Size,																
								"objects.$.title2Size":model.title2Size,
								"objects.$.objectDescription":model.objectDescription,																
								"objects.$.actionType":model.actionType,								
								"objects.$.originalPrice":model.originalPrice,
								"objects.$.biinPrice":model.biinPrice,
								"objects.$.discount":model.discount,
								"objects.$.savings":model.savings,
								"objects.$.biinSold":model.biinSold,
								"objects.$.timeFrame":model.timeFrame,
								"objects.$.imageUrl":model.imageUrl,
								"objects.$.categories":model.categories																																																																
							}},function(err,data){
							if(err)
								throw err;    		
						});
				}
				callback();
	    	}
    	});
	}

    //Remove the elments in showcases associted
    function removeElementsInShowcases(elementId,callback){
    	console.log("Remove elements in showcase: "+elementId );
    	//Update the showcases associated
    	showcase.find({"objects.objectIdentifier":elementId},"",function(err,data){
    		if(err)
    			throw err;
    		else
    			if(data){

    				//Iterate over the elements
    				for(var i=0;i<data.length;i++){
    					var workingElement = data[i];

    					//analizing the element:
    					var removedElement = false;
    					var elementToRemovePosition = -1;

    					//Search for the object to remove in showcases
    					for(var objElement =0; objElement<workingElement.objects.length && removedElement ==false; objElement++){    			
    						if(workingElement.objects[objElement].objectIdentifier === elementId){
    							removedElement =true;    							
    							elementToRemovePosition = workingElement.objects[objElement].position;
    							workingElement.objects.splice(objElement,1);
    						}
    					}

    					//Update the elements position in the showcase
    					for(var objElementPos =0; objElementPos<workingElement.objects.length;objElementPos++){
    						if(workingElement.objects[objElementPos].position>elementToRemovePosition){
    							workingElement.objects[objElementPos].position--;
    						}
    					}

    					//Update in the database
    					showcase.update({"_id":workingElement._id},{$set:{"objects":workingElement.objects}},{ upsert : false },
                                    function(err){
                                    	if(err)
                                    		throw err;
                                    });
    				}
    				//Call the callback
    				callback();
    			}
    	})
    }


    //Other methods
	getOganization = function(req, res, callback){
		var identifier=req.param("identifier");

		organization.findOne({"accountIdentifier":req.user.accountIdentifier,"identifier":identifier},{sites:true, name:true, identifier:true},function (err, data) {
			req.session.selectedOrganization = data;
			callback(data,req,res);
		});
	}
	return functions;
}
