module.exports =function(){

	var util = require('util'), fs= require('fs'), path = require("path"), moment=require("moment");

	//Custom Utils
	var utils = require('../biin_modules/utils')();	

	//Schemas
	var gallery = require('../schemas/gallery');
	var functions ={},
		_quality = 100,
	    _workingImagePath='./public/workingFiles/',
	    _uploadImageDirectory = "/workingFiles/";

	//GET the index of Gallery
	functions.index = function(req,res){
		res.render('gallery/index', { title: 'Gallery list' ,user:req.user});
	}	

	//Return a list of gallery files
	functions.list =function(req,res){
		gallery.find({accountIdentifier:req.user.accountIdentifier},function(err,data){
			res.json(data);
		});
	}	

	//PUT Files
	functions.upload=function(req,res){

		var userAccount = req.user.accountIdentifier;
		var filesUploaded =[];

		res.set("Content-Type","application/json");
		console.log(util.inspect(req.files,{showHidden:false}))

		var uploadFile = function(file){
			//Read the file
	 		var name = file.originalFilename;	 		
	 		var data = fs.readFileSync(file.path);

	 		//Asign the new temporal paths
	 		var systemImageName = utils.getImageName(name,_workingImagePath); 
	 		var newPath = process.env.IMAGES_REPOSITORY+systemImageName;
	 		var localPath = path.join(_workingImagePath,systemImageName);

	 		// write file to uploads/fullsize folder
			var err=  fs.writeFileSync(localPath, data);

			if(err){
		  		throw err;
		  	}
		  	else{

		  		var galObj = {identifier:systemImageName,accountIdentifier:userAccount,
		  		originalName:name, localUrl:localPath,  serverUrl: newPath, dateUploaded: moment().format('YYYY-MM-DD h:mm:ss')};

		  		filesUploaded.push(galObj);
		  	}
		}

		//Upload of the files
		if(util.isArray(req.files.file))
		 	for(var i=0; i< req.files.file.length; i++){
		 		uploadFile(req.files.file[i])
		 	}
		else
			uploadFile(req.files.file)	 		

	 	//Regist the models
	 	gallery.create(filesUploaded, function(err){
	 		if (err)
	 			throw err;
	 		else
	 			res.json(filesUploaded);
	 	});
	}

	return functions;
}	