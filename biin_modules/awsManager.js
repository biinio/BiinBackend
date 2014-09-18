/*
*
*	Exports the AWS Module
*
*/
module.exports = function(){

	var AWS = require('aws-sdk'),
			  s3=new AWS.S3();
	var util= require('util'), path = require('path');
	var buquetName = ""; // Todo set the buquet Name
	var functions = {};
	AWS.config.region = 'us-west-2';
	
	//
	//Create a buquet credentials
	functions.createBucket=function(buquetFolder,callbak){
		s3.headBucket({Bucket:buquetFolder},function(err,data){
			if(err){
				s3.createBucket({Bucket:buquetFolder},function(err,data){
					callbak(err,data);
				});
			}else{
				callbak(null,{status:"Buquet Ready Exist"});
			}
		});
	}

	//
	//Put the Object in to a buquet
	functions.uploadObjectToBuquet=function(buquetOwner,objKey,stream){
		var params = {
		  Bucket: buquetOwner,//buquetOwner, /* required */
		  Key: objKey, /* required */
		  ACL: 'public-read',
		  Body:stream
		};

		//Put the object to the buquet
		s3.putObject(params,function(err,data){
			if(err)
				throw err;
			return 	data;
		});
	}

	functions.uploadFileToBuket = function(){

	}

	return functions;
}