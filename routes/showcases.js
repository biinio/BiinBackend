module.exports = function () {
    //Packages
    var moment = require('moment');

    //Custom Utils
  	var imageManager = require("../biin_modules/imageManager")();

	//Schemas
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

	//PUT an update of the showcase
	functions.set=function(req,res){	   	   
		var model =req.body.model;
		if(model)
		{
			var showcaseIdentifier=req.param("showcase");
			var model = req.body.model;			
			delete model._id;
			showcase.update(
                     { identifier:showcaseIdentifier},
                     { $set :model },
                     { upsert : true },
                     function(err){
                     	
                     	if(err)
							res.json(null);
						else{
							//Update the biins last update property asynchronous
                            updateBiinsLastUpdate(showcaseIdentifier);
                            //Return the state
							res.json({state:'updated'});							
						}
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
			imageManager.cropImage(process.env.SHOWCASE_PIXEL_EQ,"showcase",req.body.imgUrl,req.body.imgW,req.body.imgH,req.body.cropW,req.body.cropH,req.body.imgX1,req.body.imgY1,function(err,data){
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
***/

	//Update Biins Last Update in Regions
    function updateBiinsLastUpdate(showcaseId){
      	var updateDate = moment().format('YYYY-MM-DD h:mm:ss');
      	region.find({"biins.showcaseIdentifier":showcaseId},"",function(err,data){
      		if(err)
      			throw err
      		else
      			if(data){
      			  //Iterate over the regions
      		      for(var i=0;i<data.length; i++){
                      //Iterate over the biins
                      var lengthOfBiins = data[i].biins.length;
                      for(var j=0;j < lengthOfBiins;j++){
                          if(data[i].biins[j].showcaseIdentifier===showcaseId){
                          	data[i].biins[j].lastUpdate = updateDate;
                          }
                      }
                      var objectId = data[i]._id;
                      var model =  JSON.parse(JSON.stringify(data[i]));;
                      delete model._id;
                      //For each regions set the update
                      region.update({ _id:objectId},
                                    { $set :model },
                                    { upsert : true },
                                    function(err){
                                    	if(err)
                                    		throw err;
                                    });
      		      }
      		    }
      	});
    }

	return functions;
}