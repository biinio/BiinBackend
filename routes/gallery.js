module.exports =function(){

	var util = require('util'), fs= require('fs'), path = require("path"), moment=require("moment");

	//Custom Utils
	var utils = require('../biin_modules/utils')();	

	//Schemas
	var gallery = require('../schemas/gallery'), organization = require('../schemas/organization');
	var functions ={},
		_quality = 100,
	    _workingImagePath='./public/workingFiles/',
	    _uploadImageDirectory = "/workingFiles/";

	//GET the index of Gallery
	functions.index = function(req,res){
		var organizationId = req.param("identifier");

		var callback= function(organization,req, res){
			console.log("The organization is " + util.inspect(organization,{depth:null}));
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

			   console.log("The find gallery is: "+util.inspect(gallery,{depth:null}));
			   res.json({data:gallery, prototypeObj : galleryProto});
		});			
	}	

	//PUT Files
	functions.upload=function(req,res){
		var organizationId = req.param("identifier");
		var userAccount = req.user.accountIdentifier;
		var filesUploaded =[];
		//FTP IMAGES SERVER UPLOAD
		var ftpConn = utils.get.FTPConn();

		res.set("Content-Type","application/json");

		var uploadFile = function(file, serverCopy){
			//Read the file
	 		var name = file.originalFilename;	 		
	 		var data = fs.readFileSync(file.path);

	 		//Asign the new temporal paths
	 		var systemImageName = utils.getImageName(name,_workingImagePath); 
	 		var ftpPath =process.env.FTP_BIIN_IMAGES_URL+systemImageName;
	 		var newPath = process.env.IMAGES_REPOSITORY+systemImageName;
	 		var localPath = path.join(_workingImagePath,systemImageName);

	 		// write file to uploads/fullsize folder
			var err=  fs.writeFileSync(localPath, data);

			if(err){
		  		throw err;
		  	}
		  	else{

		  		var url = "https://"+process.env.FTP_HOST+process.env.FTP_BIIN_IMAGES_URL+systemImageName;
		  		var galObj = {identifier:systemImageName,accountIdentifier:userAccount,
		  		originalName:name, localUrl:localPath,  serverUrl: ftpPath, dateUploaded: moment().format('YYYY-MM-DD h:mm:ss'),url:url};

		  		console.log("Going to put the image: "+ util.inspect(galObj,{depth:null}));
		  		if(serverCopy)
		  			serverCopy(galObj);		  		
		  		filesUploaded.push(galObj);
		  	}
		}
		var serverCopy=function(galItem){
			try{
				ftpConn.keepAlive();	
			}catch(ex)
			{//Try Get Again the Ftp Connection
				ftpConn =utils.get.FTPConn();
			}
			console.log("Server Ftp Upload: "+  galItem.originalName);
			console.log("The Path: "+ galItem.localUrl);
			console.log("The Server Path: "+ galItem.serverUrl);
       		ftpConn.put(galItem.localUrl,galItem.serverUrl,function(err){
       			if(err)
       				throw err;
       		});
		}

		//Upload of the files
		if(util.isArray(req.files.file))
		 	for(var i=0; i< req.files.file.length; i++){
		 		uploadFile(req.files.file[i],serverCopy)
		 	}
		else
			uploadFile(req.files.file,serverCopy)	 		


		organization.update({"accountIdentifier":userAccount,"identifier":organizationId},
		 {$push:{gallery:{$each:filesUploaded}}},
		 { upsert : false},
         function(err, cantAffected){
         	console.log("The cant affected where:" + cantAffected);
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