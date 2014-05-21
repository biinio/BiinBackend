module.exports = function () {
	var fs = require("fs");
	var gm = require('gm')
  	,imageMagick = gm.subClass({ imageMagick: true });
	var im = require('imagemagick');
	var path = require('path');
	var showcase = require('../schemas/showcase');
	var region = require('../schemas/region');
	var functions = {};

	//GET the index view of a showcases
	functions.index = function(req,res){
		res.render('showcase/index', { title: 'Organizations list' ,user:req.user});
	}

	//GET the list of showcases
	functions.list = function(req,res){
		showcase.find({},function (err, data) {
			   res.json(data);
		});		
	}

	//GET a showcase By Id
	functions.get=function(req,res){
		var showcaseIdentifier = req.param("identifier");
   		showcase.findOne({"identifier":showcaseIdentifier},'',function(err,data){
   			if(data){
   				var showcaseInstance = new showcase();
   				showcaseInstance.title="hellow";
   				res.json({data:{showcase:data}, propotypeObj : showcaseInstance});
   			}   				
   			else
   				res.json(null);
   		});
	}

	//POST an update of the showcase
	functions.set=function(req,res){
	
		var model =req.body.model;
		if(model)
		{
			var model = req.body.model;
			delete model._id;
			showcase.update(
                     { identifier:req.param("showcase")},
                     { $set :model },
                     { upsert : true },
                     function(err){
                     	if(err)
							res.json(null);
						else
							res.json({state:'updated'});
                     }
                   );
		}
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

	//POST an image for a showcase
	functions.imagePost=function(req,res,next){	  
		console.log();
	 	var fstream;
		req.pipe(req.busboy);
		req.busboy.on('file', function (fieldname, file, filename) {
			var imgPath = './public/workingFiles/' + filename;
			var readPath =req.headers.origin+'/workingFiles/' + filename;
		    fstream = fs.createWriteStream(imgPath);
		    file.pipe(fstream);
		    fstream.on('close', function () {
		        var objResult = {
		        	"status":"success",
					"url":readPath
		        }

		        // obtain the size of an image
				im.identify(imgPath, function(err, features){					
				  if (err) throw err

				  objResult.width = features.width;
			  	  objResult.height = features.height;
		          res.json(JSON.stringify(objResult));
				});
		    });
		});
	}
	
	//POST image crop
	functions.imageCrop=function(req,res,next){
		// use req.body
		var imageUrl = req.body.imgUrl;
		var imageName= path.basename(imageUrl);
		var pathImage = './public/workingFiles/'+imageName;
		console.log("ImageName: "+imageName);
		try
		{		
			imageMagick(pathImage)
			.resize(req.body.imgW, req.body.imgH)
			.crop(req.body.cropW,req.body.cropH,req.body.imgX1,req.body.imgY1)
			.quality(50)
			.write(pathImage, function (err) {
				if (err){
					console.log(err);
					throw err;
				};
				var jsonObj = {
				 	status:"success",
				 	url:imageUrl
				}
				console.log("image resizing success");
				res.json(JSON.stringify(jsonObj));	  
			});
	  	}
		catch(err){
		  	console.log(err);
		}
	}
	return functions;
}