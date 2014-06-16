/*
	Image utility manager
*/
module.exports = function(){
	var path = require("path"),fs = require("fs"), uuid=require("node-uuid");
	var gm = require("gm"),imageMagick = gm.subClass({ imageMagick: true });
    var utils = require("./utils")();
	
	var functions={},
		_quality = 100,
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
				imageMagick(succes.localPath).size(function(err, value){					
				  
				  if (err) throw err
				  succes.width = value.width;
			  	  succes.height = value.height;
                  
                  delete succes.localPath;
		          callback(err,succes);
				});
			}
		});
	}

	//Crop an Image
	functions.cropImage = function(pixelEquival,moduleOwner, imageUrl, resizeW, resizeH, cropW, cropH, positionX, positionY, callback){
		var that = this;      
		var imageName= path.basename(imageUrl);
		var pathImage = _workingImagePath+imageName;
       	
       	//Pixel ajustment for cropper
       	resizeW*=pixelEquival;
       	resizeH*=pixelEquival;
       	cropH*=pixelEquival;
       	cropW*=pixelEquival;
       	positionX*=pixelEquival;
       	positionY*=pixelEquival;

       var imageFTPPath="";
       switch(moduleOwner){
       	case "showcase":imageFTPPath=process.env.FTP_BIIN_IMAGES_URL;
       	  break;
       }		//Image magic convertion

		imageMagick(pathImage)
		.resize(resizeW*pixelEquival, resizeH)
		.crop(cropW,cropH,positionX,positionY)
		//.quality(_quality)
		.write(pathImage,function(err,data){
			if (err)
				callback(err)
			else{
				that.copyToFtp(pathImage,imageFTPPath,imageName,function(err){
                  if(err)       
                  	callback(err);
                  else
                   var jsonObj = {
				 	status:"success",
				 	url:"http://"+process.env.FTP_HOST+imageFTPPath+imageName
				    }	
				    callback(err,jsonObj);
				});								
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

              var systemImageName = utils.getImageName(imageName,_workingImagePath);              
			  var newPath = process.env.IMAGES_REPOSITORY+systemImageName;
			  var localPath = path.join(_workingImagePath,systemImageName);
               
			  /// write file to uploads/fullsize folder
			  fs.writeFile(localPath, data, function (err) {
			  	if(err){
			  		callback(err)
			  	}
			  	else{
			        console.log(newPath);
				  	var success ={
				  		status:"success",
				  		url:newPath,
				  		localPath:localPath
				  	}
				  	callback(null,success);
			  	}
			  });
			}
		});
	}
     
    //Copy a image to a FTP server
    functions.copyToFtp = function(localPath,ftpPath, systemImageName,callback){             
       var remotePath = ftpPath+systemImageName;
       utils.FTPUpload(localPath,remotePath,callback);
    }

	return functions;
}