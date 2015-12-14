module.exports = function(){
	var functions ={};
	var mobileUser = require('../schemas/mobileUser');
	var element = require('../schemas/element'), showcase = require('../schemas/showcase'), organization= require('../schemas/organization'), biins = require('../schemas/biin');
	var imageManager = require("../biin_modules/imageManager")(), utils = require('../biin_modules/utils')() , routesUtils = require('../biin_modules/routesUtils')();
	var _= require('underscore');
	var zlib = require('zlib');

    // Default image for elements
    var ELEMENTS_DEFAULT_IMAGE = {
        domainColor: '170, 171, 171',
        mediaType: '1',
        title1: 'default',
        url: 'https://biinapp.blob.core.windows.net/biinmedia/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/media/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/4e8b2fb3-af89-461d-9c37-2cc667c20653/media/4af24d51-2173-4d41-b651-d82f18f00d1b.jpg',
        vibrantColor: '170, 171, 171',
        vibrantDarkColor: '85,86,86',
        vibrantLightColor: '170, 171, 171'
    };

	//Get the index view of the elements
	functions.index = function(req,res){
		var callback= function(organization,req, res){
			res.render('element/index', { title: 'Elements List' ,user:req.user, organization:organization, isSiteManteinance:true});
		}
		//getOganization
		routesUtils.getOrganization(req.param("identifier"),req,res,{name:true, identifier:true},callback)
	}

	functions.galleryWidget = function(req, res) {
        res.render('_partials/galleryWidget');
    }


	//GET the list of elements
	functions.list = function(req,res){
		organization.findOne({"identifier":req.param('identifier')},{elements:true, name:true, identifier:true},function (err, data) {
			req.session.selectedOrganization = data;
			res.json({data:data});
		});
	}

	//GET Mobile info of Elements
	functions.getMobile=function(req,res){
		var biinieIdentifier= req.param("biinieIdentifier");
		var identifier=req.param("identifier");

		if(identifier){
			mobileUser.findOne({identifier:biinieIdentifier},{"biinieCollections":1, "likeObjects":1, "followObjects":1, "biinieCollect":1, "shareObjects":1, "seenElements":1},function(err,userInfo){
				organization.findOne({"elements.elementIdentifier":identifier},{"elements.$":1},function(err,data){
					if(err)
						res.json({data:{},status:"7", result:'0'});
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
								media.mediaType="1";
								media.domainColor=  getColor(data.elements[0].media[i].mainColor);
								media.url = data.elements[0].media[i].url;
								media.vibrantColor= data.elements[0].media[i].vibrantColor ? data.elements[0].media[i].vibrantColor : "0,0,0";
								media.vibrantDarkColor= data.elements[0].media[i].vibrantDarkColor ? data.elements[0].media[i].vibrantDarkColor : "0,0,0";
								media.vibrantLightColor= data.elements[0].media[i].vibrantLightColor ? data.elements[0].media[i].vibrantLightColor : "0,0,0";
								elementObj.media.push(media);
							}

                            //Add default image if none was uploaded
                            if (data.elements[0].media.length == 0) {
                                    elementObj.media.push(ELEMENTS_DEFAULT_IMAGE);
                                }

							var isUserBiined = false;
							for(var i=0; i<userInfo.biinieCollections.length & !isUserBiined;i++){
								var elUserBiined =_.findWhere(userInfo.biinieCollections[i].elements,{identifier:identifier})
								if(elUserBiined)
									isUserBiined=true;
							}

							var isUserCollect = false;
							for(var i=0; i<userInfo.biinieCollections.length & !isUserCollect;i++){
								var elUserCollect =_.findWhere(userInfo.biinieCollections[i].elements,{identifier:identifier})
								if(elUserCollect)
									isUserCollect=true;
							}

							var isUserShared = false;
							var userShareElements = _.filter( userInfo.shareObjects, function(like){ return like.type === "element"});
							var elUserShared =_.findWhere(userShareElements,{identifier:identifier})
							if(elUserShared)
								isUserShared=true;


							var isUserLike = false;
							var userLikeElements = _.filter( userInfo.likeObjects, function(like){ return like.type === "element"});
							var elUserLike =_.findWhere(userLikeElements,{identifier:identifier})
							if(elUserLike)
								isUserLike=true;


							var isUserFollow = false;
							var userFollowElements = _.filter( userInfo.followObjects, function(like){ return like.type === "element"});
							var elUserFollow =_.findWhere(userFollowElements,{identifier:identifier})
							if(elUserFollow)
								isUserFollow=true;

							var isUserViewedElement = false;
							var elUserViewed =_.findWhere(userInfo.seenElements,{elementIdentifier:identifier})
							if(elUserViewed)
								isUserViewedElement=true;
							//elementObj.hasFromPrice=!elementObj.hasFromPrice?elementObj.hasFromPrice:"0";
							//elementObj.hasQuantity=!elementObj.hasFromPrice?elementObj.hasFromPrice:"0";

							elementObj.hasQuantity=eval(elementObj.hasQuantity)?"1":"0";
							elementObj.hasSticker=elementObj.sticker && elementObj.sticker.type ? "1":"0"
							elementObj.biinedCount =  elementObj.biinedCount?""+elementObj.biinedCount:"0";
							elementObj.collectCount = elementObj.collectCount?""+elementObj.collectCount:"0";
							elementObj.commentedCount =  elementObj.commentedCount?""+elementObj.commentedCount:"0";
							elementObj.sharedCount=elementObj.sharedCoun?""+elementObj.sharedCount:"0";
							elementObj.userBiined=isUserBiined?"1":"0";
							elementObj.userShared=isUserShared?"1":"0";
							elementObj.userFollowed=isUserFollow?"1":"0";
							elementObj.userLiked=isUserLike?"1":"0";
							elementObj.userCollected=isUserCollect?"1":"0";
							elementObj.userViewed= isUserViewedElement?"1":"0";
							elementObj.userCommented="0";
							elementObj.isActive="1";
							elementObj.position=elementObj.position?elementObj.position:"1";
							elementObj.identifier= elementObj.elementIdentifier;
							elementObj.detailsHtml=elementObj.detailsHtml?elementObj.detailsHtml:"";

							var userRating = _.findWhere(elementObj.rating,{biinieIdentifier:biinieIdentifier});
							elementObj.userStars = typeof(userRating)!=="undefined"? ""+ userRating.rating : "0";
							var rating = 0;

							if(elementObj.rating && elementObj.rating.length >0){
								for (var i = elementObj.rating.length - 1; i >= 0; i--) {
									rating += elementObj.rating[i].rating;
								};
								rating = rating/elementObj.rating.length;
							}
							elementObj.stars = ""+rating;

							elementObj.stars = "0";

							elementObj.price = typeof(elementObj.price) === "number"? elementObj.price + "" : elementObj.price;

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
							//delete elementObj.categories;
							delete elementObj.activateNotification;

							//To implement
							/*
								"reservedQuantity": "34",
		        				"claimedQuantity": "23",
		        				"actualQuantity": "12",
	        				*/

							res.json({data:elementObj,status:"0",result:"1"});
						}else{
							res.json({data:{},status:"9", result:"0"});
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
				res.json({data:{},status:"5",result:"0"});
			}else{
				if(foundCategories && "categories" in foundCategories){

					if(foundCategories.categories.length===0)
						res.json({data:{},status:"9",result:"0"});
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
									res.json({data:{err:err},status:"5",result:"0"});
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
								res.json({data:{},status:"9",result:"0"});

							}
							else{
								result.status="0";
								result.result="1";
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
					res.json({status:"9",data:{},result:"0"});
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
         newModel.organizationIdentifier = organizationIdentifier;

         organization.update({
         	identifier:organizationIdentifier
         },
         {
         	$push:{elements:newModel}
         },
         function(err, raw){
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
					{identifier:organizationIdentifier,"elements.elementIdentifier":elementIdentifier},
					{$set:setModel},
					{upsert:false},
					function(err,raw){
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

	//DELETE an specific element
	functions.delete= function(req,res){
		//Perform an update
		var organizationIdentifier = req.param('identifier');
		var elementIdentifier=req.param("element");

        //remove elements from organization.elements
		organization.update({
            identifier:organizationIdentifier
        },{
            $pull:{elements:{elementIdentifier:elementIdentifier}}
        }, function(err){
        if(err)
            throw err;
        else {
            //remove elements from elements from organization.showcases.elements
            organization.findOne({
                identifier:organizationIdentifier
            },{}, function(err, org){
                if (err) { throw err; }
                else {
                    var siteCount;
                    for (siteCount = 0; siteCount < org.sites.length; siteCount++) {
                        var showCount;
                        for (showCount = 0; showCount < org.sites[siteCount].showcases.length; showCount++) {
                            var newElementsArray = _.filter(org.sites[siteCount].showcases[showCount].elements,function(element){
                                return element.identifier != elementIdentifier;
                            });
                            org.sites[siteCount].showcases[showCount].elements = newElementsArray;
                        }
                    }
                    org.save(function(err){
                        if(err)
                        { throw err; }
                        else {
                            //remove elements from showcases table
                            showcase.update({
                                organizationIdentifier: organizationIdentifier
                            },{
                                $pull:{elements:{elementIdentifier: elementIdentifier}}
                            }, {
                                multi:true
                            }, function(err) {
                                if (err) { throw err; }
                                else {
                                    // remove biins which have the element associated
                                    biins.update({
                                        organizationIdentifier: organizationIdentifier
                                    }, {
                                        $pull:{objects:{identifier: elementIdentifier}}
                                    }, {
                                        multi: true
                                    }, function(err) {
                                        if (err) { throw err; }
                                        else {
                                            res.json({state:"success"});
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
            }
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
			imageManager.cropImage("element",req.body.url,req.body.imgW,req.body.imgH,req.body.cropW,req.body.cropH,req.body.imgX1,req.body.imgY1,function(err,data){
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
	    	showcase.find({"elements.elementIdentifier":elementId},"",function(err,data){
				if(err){
					throw err;
				}
				else{
					for(var i=0; i<data.length;i++){
						showcase.update({"identifier":data[i].identifier,"elements.elementIdentifier":elementId},
						{$set:{"elements.$":model,
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
    	if(pcolor && pcolor.split(',').length == 3) {
    		return pcolor.replace('rgb(','').replace(')','');
    	}else{
    		return '255,255,255'
    	}
    }

	return functions;
}
