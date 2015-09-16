module.exports =function(){

	var util = require('util'), fs= require('fs'), path = require("path"), moment=require("moment");
	var gm = require("gm"),imageMagick = gm.subClass({ imageMagick: true });
	var Vibrant = require('node-vibrant');

	//Custom Utils
	var utils = require('../biin_modules/utils')();	

	//Schemas
	var gallery = require('../schemas/gallery'), organization = require('../schemas/organization'), imageManager=require('../biin_modules/imageManager')();
	var functions ={},
		_quality = 100,
	    _workingImagePath='./public/workingFiles/',
	    _uploadImageDirectory = "/workingFiles/";
	
	var oauthMobileAPIGrants = require('../routes/oauthMobileAPIGrants')();	
	//GET the index of Gallery
	functions.index = function(req,res){
		var organizationId = req.param("identifier");

		var callback= function(organization,req, res){
			res.render('gallery/index', { title: 'Gallery list' ,user:req.user, organization:organization, isSiteManteinance:true});
		}

		//If the organization header is not in cache try to get it
		//if(!req.session.selectedOrganization || req.session.selectedOrganization.identifier!= organizationId){			
			 getOganization(req, res, callback);
	}	

	//Return a list of gallery files
	functions.list =function(req,res){

		var organizationIdentifier = req.param("identifier");
		var galleryProto = new gallery();
		galleryProto.organizationIdentifier = organizationIdentifier;

		organization.findOne({accountIdentifier:req.user.accountIdentifier, identifier:organizationIdentifier},{'gallery':1},function (err, data) {
			  var gallery = null;
			  	if(data && 'gallery' in data)
			  		gallery = data.gallery;
			  	
			   res.json({data:gallery, prototypeObj : galleryProto});
		});			
	}	

	//PUT Files
	functions.upload=function(req,res){
		var organizationId = req.param("identifier");
		var userAccount = req.user.accountIdentifier;
		var filesUploaded =[];

		var imagesDirectory = path.join(userAccount,organizationId);
		res.set("Content-Type","application/json");

		var uploadFile = function(file,callback){
			//Read the file
	 		var name = file.originalFilename;	 		
	 		var data = fs.readFileSync(file.path);
	 		var systemImageName = userAccount+organizationId+ utils.getImageName(name,_workingImagePath); 

	 		var mainColor="";
	 		imageManager.uploadFile(file.path,imagesDirectory,systemImageName,true,function(imgURL){
		 		var tempId=utils.getUIDByLen(40)+".";

				imageMagick(file.path).format(function(err,format){
					var tempPath=_workingImagePath+tempId+format;
			 		imageMagick(file.path).size(function(err,size){	 
			 			var height=size.height*100/70;			
			 			var width=size.width*100/70;		 			
			 			imageMagick(file.path)
			 					.depth(8,function(err,data){
			 						if(err)
			 							console.log(err);
			 					})
			 					.write(tempPath,function(err,data){
			 						var vibrant = new Vibrant(tempPath);
			 						vibrant.getSwatches(function(error,swatches){
		 								var mainColorRGB =  swatches.Vibrant.rgb;
		 								var darkVibrantRGB =  swatches.DarkVibrant.rgb;
		 								var lightVibrantRGB =  swatches.LightVibrant.rgb;
		 								mainColor = "" + parseInt(mainColorRGB[0]) + "," + parseInt(mainColorRGB[1]) + "," + parseInt(mainColorRGB[2]);
		 								var vibrantColor = mainColor;
		 								var darkVibrantColor = "" + parseInt(darkVibrantRGB[0]) + "," + parseInt(darkVibrantRGB[1]) + "," + parseInt(darkVibrantRGB[2]);
		 								var lightVibrantColor = "" + parseInt(lightVibrantRGB[0]) + "," +parseInt(lightVibrantRGB[1]) + "," + parseInt(lightVibrantRGB[2]);


		 								if(fs.existsSync(tempPath)){
			 								fs.unlink(tempPath,function(err){
			 									console.log("The image was removed succesfully");
			 								});
			 							}

							  			var galObj = {identifier:systemImageName,accountIdentifier:userAccount,
							  			originalName:name,url:imgURL,serverUrl: "",localUrl:"", dateUploaded: moment().format('YYYY-MM-DD h:mm:ss'),
							  			mainColor:mainColor,
							  			vibrantColor:vibrantColor,
							  			vibrantDarkColor:darkVibrantColor,
							  			vibrantLightColor:lightVibrantColor
							  			};

							  			callback(galObj);	 		
			 						});

			 						/*
			 						imageMagick(tempPath).identify('%[pixel:s]',function(err,color){
						 				console.log("Color of resized with Write: " +color);
						 				mainColor=color.replace("srgb(","");
						 				mainColor=mainColor.replace(")","");

							 			if(fs.existsSync(tempPath)){
				 							fs.unlink(tempPath,function(err){
				 								console.log("The image was removed succesfully");
				 							});
				 						}

								  		var galObj = {identifier:systemImageName,accountIdentifier:userAccount,
								  		originalName:name,url:imgURL,serverUrl: "",localUrl:"", dateUploaded: moment().format('YYYY-MM-DD h:mm:ss'),
								  		mainColor:mainColor
								  		};

								  		callback(galObj);	 		

						 			});
									*/
			 					})
			 		})	 			
		 		});
	 		});	
		}

		//Update the organization
		var organizationUpdate = function(){
			organization.update({"accountIdentifier":userAccount,"identifier":organizationId},
			 {$push:{gallery:{$each:filesUploaded}}},
			 { upsert : false},
	         function(err, raw){
	         	if(err){
	         		throw err;
	         		res.json(null);
	         	}
				else{
	                //Return the state
					if (err)
		 				throw err;
			 		else
			 			res.json(filesUploaded);
				}
	         });	
		}

		//Upload of the files
		if(util.isArray(req.files.file)){
			var cantUploaded=0;
			var totalToupload=req.files.file.length;
		 	for(var i=0; i< req.files.file.length; i++){
		 		uploadFile(req.files.file[i],function(galToUpload){
		 			cantUploaded++;
		 			filesUploaded.push(galToUpload);
		 			if(cantUploaded===totalToupload){
						//Lets update the buquet
		 				setTimeout(organizationUpdate,60*60);		
		 			}
		 		});
		 		
		 	}		 		 	
		}

		else{
			uploadFile(req.files.file,function(galToUpload){
		 			filesUploaded.push(galToUpload);
		 			//Lets update the buquet
					setTimeout(organizationUpdate,60*60);
		 		});		
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

	return functions;
}	