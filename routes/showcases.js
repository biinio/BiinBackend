module.exports = function () {
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
   				if(req.session)
   					req.session.current = data;
   				res.json({data:{showcase:data}});
   			}   				
   			else
   				res.json(null);
   		});
	}

	//POST a showcase
	functions.set=function(req,res){
		
		console.log("sessioncurren: "+req.session.current);
		var model = req.session.current;
		console.log("model:"+req.body.model);
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

	return functions;
}