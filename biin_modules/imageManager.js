/*
	Image utility manager
*/
module.exports = function(){
	var path = require('path');
	var fs = require("fs");
	var gm = require('gm')
  	,imageMagick = gm.subClass({ imageMagick: true });
	
	var functions={},
		_quality = 50,
	    _workingImagePath='./public/workingFiles/',
	    _uploadImageDirectory = "/workingFiles/";

	//*************** Region Methods **************

	//Upload an image
	functions.upload = function(originUrl,imagePath, imageName,callback){
		this.uploadFile(originUrl,imagePath,imageName,function(err,succes){
			if(err){
				callback(err);
			}
				
			else
			{			
				// obtain the size of an image
				imageMagick(succes.url).size(function(err, value){					
				  
				  if (err) throw err
				  succes.width = value.width;
			  	  succes.height = value.height;

		          callback(err,succes);
				});
			}
		});
	}

	//Crop an Image
	functions.cropImage = function(moduleOwner, imageUrl, resizeW, resizeH, cropW, cropH, positionX, positionY, callback){
		console.log("Image Url: " +imageUrl);
		var imageName= path.basename(imageUrl);
		var pathImage = _workingImagePath+imageName;

		//Image magic convertion
		imageMagick(pathImage)
		.resize(resizeW, resizeH)
		.crop(cropW,cropH,positionX,positionY)
		.quality(_quality)
		.write(pathImage,function(err,data){
			if (err)
				callback(err)
			else{
				var jsonObj = {
				 	status:"success",
				 	url:imageUrl
				}	
				callback(err,jsonObj);				
			}
		});
	} 

	//Uploads an image
	functions.uploadFile = function(originUrl,imagePath, imageName,callback){
		fs.readFile(imagePath, function (err, data) {
			/// If there's an error
			if(!imageName){
				var err = {
					status:"error"
				}
				callback(err);

			} else {

			  var newPath = originUrl + _uploadImageDirectory + imageName;
			  var localPath = _workingImagePath + imageName;

			  /// write file to uploads/fullsize folder
			  fs.writeFile(localPath, data, function (err) {
			  	if(err)
			  		callback(err)
			  	else{
				  	var success ={
				  		status:"success",
				  		url:newPath
				  	}
				  	callback(null,success);
			  	}
			  });
			}
		});
	}

	return functions;
}