module.exports =function(){

	var util = require('util'), fs= require('fs'), path = require("path"), moment=require("moment");

	//Custom Utils
	var utils = require('../biin_modules/utils')();	

	//Schemas
	var gallery = require('../schemas/gallery'), organization = require('../schemas/organization'), imageManager=require('../biin_modules/imageManager')();
	var functions ={},
		_quality = 100,
	    _workingImagePath='./public/workingFiles/',
	    _uploadImageDirectory = "/workingFiles/";

	//GET the index of Gallery
	functions.index = function(req,res){
		var organizationId = req.param("identifier");

		var callback= function(organization,req, res){
			res.render('gallery/index', { title: 'Gallery list' ,user:req.user, user:req.user, organization:organization, isSiteManteinance:true});
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

		var uploadFile = function(file){
			//Read the file
	 		var name = file.originalFilename;	 		
	 		var data = fs.readFileSync(file.path);
	 		var systemImageName = userAccount+organizationId+ utils.getImageName(name,_workingImagePath); 

	 		var imgURL= imageManager.uploadFile(file.path,imagesDirectory,systemImageName);
	  		var galObj = {identifier:systemImageName,accountIdentifier:userAccount,
	  		originalName:name,url:imgURL,serverUrl: "",localUrl:"", dateUploaded: moment().format('YYYY-MM-DD h:mm:ss')};

	  		return galObj;	 		
		}

		//Update the organization
		var organizationUpdate = function(){
			organization.update({"accountIdentifier":userAccount,"identifier":organizationId},
			 {$push:{gallery:{$each:filesUploaded}}},
			 { upsert : false},
	         function(err, cantAffected){
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
		 	for(var i=0; i< req.files.file.length; i++){
		 		var galToUpload =uploadFile(req.files.file[i]);
		 		filesUploaded.push(galToUpload);
		 	}		 
		 	//Lets update the buquet
		 	setTimeout(organizationUpdate,60*60);		
		}

		else{
			var galToUpload =uploadFile(req.files.file,serverCopy);
			filesUploaded.push(galToUpload);
			//Lets update the buquet
			setTimeout(organizationUpdate,60*60);
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