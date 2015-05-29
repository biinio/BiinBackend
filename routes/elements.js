module.exports = function(){
	var functions ={};
	var mobileUser = require('../schemas/mobileUser');
	var element = require('../schemas/element'), showcase = require('../schemas/showcase'), organization= require('../schemas/organization');
	var imageManager = require("../biin_modules/imageManager")(), utils = require('../biin_modules/utils')();
	var _= require('underscore');

	//Get the index view of the elements
	functions.index = function(req,res){
		var callback= function(organization,req, res){
			res.render('element/index', { title: 'Elements List' ,user:req.user, organization:organization, isSiteManteinance:true});
		}
		getOganization(req, res, callback);	
	}

	//GET the list of elements
	functions.list = function(req,res){

		organization.findOne({"accountIdentifier":req.user.accountIdentifier,"identifier":req.param('identifier')},{elements:true, name:true, identifier:true},function (err, data) {
			req.session.selectedOrganization = data;
			res.json({data:data});
		});
	}	

	//GET Mobile info of Elements
	functions.getMobile=function(req,res){
		var biinieIdentifier= req.param("biinieIdentifier");
		var identifier=req.param("identifier");

		if(identifier){
			mobileUser.findOne({identifier:biinieIdentifier},{"biinieCollections":1},function(err,userInfo){
				organization.findOne({"elements.elementIdentifier":identifier},{"elements.$":1},function(err,data){
					if(err)
						res.json({data:{status:"7", result:'0'}});	
					else
						if(data!=null && "elements" in data && data.elements.length>0){
							var elementObj = data.elements[0].toObject();
							elementObj.identifier = element.elementIdentifier;
							delete elementObj.identifier;
							elementObj.titleColor = getColor(elementObj.textColor);
							elementObj.subTitle = elementObj.subTitle?elementObj.subTitle :'';
							
							elementObj.reservedQuantity="0";
							elementObj.claimedQuantity="0";
							elementObj.actualQuantity="0";

							elementObj.expirationDate=elementObj.expirationDate?elementObj.expirationDate:"";
							elementObj.initialDate=elementObj.initialDate?elementObj.initialDate:"";
							delete elementObj.media;
							elementObj.media=[];
							for(var i=0; i< data.elements[0].media.length; i++){
								var media ={};
								media.mediaType=1;
								media.domainColor=  getColor(data.elements[0].media[i].mainColor);
								media.url = data.elements[0].media[i].url;
								elementObj.media.push(media);
							}

							var isUserBiined = false;
							for(var i=0; i<userInfo.biinieCollections.length & !isUserBiined;i++){
								var el =_.findWhere(userInfo.biinieCollections[i].elements,{identifier:identifier})
								if(el)
									isUserBiined=true;
							}

							//elementObj.hasFromPrice=!elementObj.hasFromPrice?elementObj.hasFromPrice:"0";
							//elementObj.hasQuantity=!elementObj.hasFromPrice?elementObj.hasFromPrice:"0";

							elementObj.hasQuantity=eval(elementObj.hasQuantity)?"1":"0";
							elementObj.hasSticker=elementObj.sticker && elementObj.sticker.type ? "1":"0"
							elementObj.biinedCount =  elementObj.biinedCount?""+elementObj.biinedCount:"0";
							elementObj.commentedCount =  elementObj.commentedCount?""+elementObj.commentedCount:"0";
							elementObj.sharedCount=elementObj.sharedCoun?""+elementObj.sharedCount:"0";
							elementObj.userBiined=isUserBiined?"1":"0";
							elementObj.userShared="0";
							elementObj.userCommented="0";
							elementObj.isActive="1";
							elementObj.position=elementObj.position?elementObj.position:"1";
							elementObj.identifier= elementObj.elementIdentifier;

							elementObj.initialDate = elementObj.initialDate? utils.getDate(elementObj.initialDate):utils.getDateNow();
							elementObj.expirationDate = elementObj.expirationDate? utils.getDate(elementObj.expirationDate):utils.getDateNow();

							if(!'hasFromPrice' in elementObj){
								elementObj.hasFromPrice='0';
								elementObj.hasFromPrice="0";
							}								
							if(!'hasPrice' in elementObj)
								elementObj.hasPrice='0';

							if(eval(elementObj.price)>0){
								elementObj.hasPrice='1'
							}else
								elementObj.hasPrice='0'
														
							delete elementObj.elementIdentifier;

							//Remove the old notifications object
							if('notifications' in elementObj)
								delete elementObj.notifications;
							delete elementObj.accountIdentifier;
							delete elementObj.organizationIdentifier;
							delete elementObj.domainColor;
							delete elementObj.actionType;
							delete elementObj.textColor;
							delete elementObj.categories;
							delete elementObj.activateNotification;

							//To implement
							/*
								"reservedQuantity": "34",
		        				"claimedQuantity": "23",
		        				"actualQuantity": "12",
	        				*/

							res.json({data:elementObj,status:"0",result:"1"});
						}else{
							res.json({data:{status:"9", result:"0"}});		
						}
				});					

			});			
		}
	}

	//GET Mobile Highligh Elements
	functions.getMobileHighligh=function(req,res){

		//Get the user identifier
		var userIdentifier= req.param('identifier');
		
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
						var result = {data:{elements:[]}};

						//Get The Elements by Each Category
						var categoriesProcessed = 0;
						var categoriesWithElements=0;

						///Get the Sites By categories
						var getElementsByCat = function(pcategory, index, total, callback){
							//Return the Elements by Categories
							//, "elements.isValid":true
							var orgResult=organization.find({'elements.categories.identifier':pcategory.identifier,'elements.isHighlight':'1'},{'elements':'1'},function(err,elementsByCategories){
								if(err)
									res.json({data:{status:"5",data:{}, err:err}});
								else
								{
									var elResult=[];
									var cantElAdded =0;

									//Remove the Organization
									for(var orgIndex =0; orgIndex<elementsByCategories.length; orgIndex++){										
										if('elements' in elementsByCategories[orgIndex] )
											for(var elIndex=0; elIndex<elementsByCategories[orgIndex].elements.length ;elIndex++){

													//TODO: Validate the isValid
													if(elementsByCategories[orgIndex].elements[elIndex].isValid=true && 'categories' in elementsByCategories[orgIndex].elements[elIndex] && elementsByCategories[orgIndex].elements[elIndex].categories.length>0 && elementsByCategories[orgIndex].elements[elIndex].isHighlight==='1'){
														//Get the categories of the Element
														var elCat = _.pluck(elementsByCategories[orgIndex].elements[elIndex].categories,'identifier')

														if(_.indexOf(elCat,pcategory.identifier)!=-1){
															elResult.push({'_id':elementsByCategories[orgIndex].elements[elIndex]._id,'elementIdentifier':elementsByCategories[orgIndex].elements[elIndex].elementIdentifier});
															cantElAdded++;
															//if(isSiteInRegion(xcord,ycord,eval(elementsByCategories[orgIndex].elements[elIndex].lat),eval(elementsByCategories[orgIndex].elements[elIndex].lng))){													
															//}
														}
													}
											}
									}	

									//Callback function
									callback(index,total,elResult,cantElAdded);									
								}

							});		

					}
					
				}

					var finalCursor=function(index,total,data,cantElements){

						if(cantElements>0){
							result.data.elements=result.data.elements.concat(data)
							categoriesWithElements++;
						}
						categoriesProcessed++;

						//Return the categories if all is processed
						if(categoriesProcessed===total){

							if(categoriesWithElements==0){
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
						getElementsByCat(foundCategories.categories[i],i,foundCategories.categories.length,finalCursor);						
					}					
				}
				else{
					res.json({status:"9",data:{}});	
				}
			}
		});		
	}

	//PUT an update of the showcase
	functions.set=function(req,res){
		var model =req.body.model;
		res.setHeader('Content-Type', 'application/json');

		//Perform an update
		var organizationIdentifier= req.param('identifier');
		var elementIdentifier=req.param("element");	

		//If is a new element
		if(typeof(elementIdentifier)==="undefined"){
   
         var newModel  = new element();

         newModel.elementIdentifier=utils.getGUID();
         newModel.accountIdentifier = req.user.accountIdentifier;
         newModel.organizationIdentifier = organizationIdentifier;

         organization.update({
         	identifier:organizationIdentifier,accountIdentifier:req.user.accountIdentifier
         },
         {
         	$push:{elements:newModel}
         },
         function(err, affectedRows){
         	if(err){
         		res.send(err,500);
         	}
         	else{
         		//Return the state and the object
         		res.send(newModel,201);
         	}
         });
		}
		else{

			//Todo Elements Showcase Update
			var model = req.body.model;
			if(model)
				delete model._id;

			//Update the model Elements in the Showcases
			updateElementsInShowcases(model,elementIdentifier,function(){
				//Update the Element
				var setModel ={};
				if(model){
					for(var field in model){
						setModel['elements.$.'+field]=model[field];						
					}
				}

				organization.update(
					{identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier,"elements.elementIdentifier":elementIdentifier},
					{$set:setModel},
					{upsert:false},
					function(err,cantAffected){
						if(err){
							throw err;
							res.json(null);
						}
						else{
							res.send(model,200);
						}
					}
				);
			});

		}
	}

	//DELETE an specific showcase
	functions.delete= function(req,res){
		//Perform an update
		var organizationIdentifier = req.param('identifier');
		var elementIdentifier=req.param("element");


		removeElementsInShowcases(elementIdentifier,function(){			
			organization.update({identifier:organizationIdentifier, accountIdentifier:req.user.accountIdentifier},{$pull:{elements:{elementIdentifier:elementIdentifier}}},function(err){
				if(err)
					throw err;
				else
					res.json({state:"success"});
			});	

		});		
	}

	//Delete elements references
	functions.removeElementsInShowcases= removeElementsInShowcases;

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
	    	showcase.find({"objects.elementIdentifier":elementId},"",function(err,data){
				if(err){
					throw err;    		
				}
				else{
					for(var i=0; i<data.length;i++){
						showcase.update({"identifier":data[i].identifier,"objects.elementIdentifier":elementId},
						{$set:{"objects.$.objectType":model.objectType,
							    "objects.$.likes":model.likes,
								"objects.$.title1":model.title1,
								"objects.$.subTitle":model.subTitle,
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

    	//Update the showcases associated
    	showcase.find({"objects.elementIdentifier":elementId},"",function(err,data){
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
    						if(workingElement.objects[objElement].elementIdentifier === elementId){
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

    //Return the Color
    function getColor(pcolor){
    	if(pcolor && pcolor.indexOf('rgb(') > -1) {
    		return pcolor.replace('rgb(','').replace(')','');
    	}else{
    		return '0,0,0'
    	}
    }

	return functions;
}
