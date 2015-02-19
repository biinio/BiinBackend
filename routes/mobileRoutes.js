module.exports =function(){
	var fs=require('fs');
	var _= require('underscore');
	var functions ={};
	var mobileUser = require('../schemas/mobileUser');
	var organization = require('../schemas/organization');
	
	//GET Categories
	/*functions.getCategories=function(req,res){
		var jsonObj= fs.readFileSync("./public/workingFiles/biinFakeJsons/getCategories.json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}*/

	//GET Regions
	functions.getRegions=function(req,res){
		var jsonObj= fs.readFileSync("./public/workingFiles/biinFakeJsons/getRegions.json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}

	//GET Element
	functions.getElement=function(req,res){
		var element = req.param("identifier");
		var jsonObj= fs.readFileSync('./public/workingFiles/biinFakeJsons/elements/'+element+".json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}

	//GET Site
	functions.getSite=function(req,res){
		var site = req.param("identifier");
		var jsonObj= fs.readFileSync('./public/workingFiles/biinFakeJsons/sites/'+site+".json", "utf8");
		res.json(JSON.parse(jsonObj));
	}

	//GET Site
	functions.getShowcase=function(req,res){
		var showcase = req.param("identifier");
		var jsonObj= fs.readFileSync('./public/workingFiles/biinFakeJsons/showcases/'+showcase+".json", "utf8");
		res.json(JSON.parse(jsonObj));
	}

	//GET Categories
	functions.getCategories=function(req,res){
		var userIdentifier = req.param("identifier");
		var xcord = req.param("xcord");
		var ycord = req.param("ycord");

		//Todo Implements Coordinates routes

		//Get the categories of the user
		mobileUser.findOne({identifier:userIdentifier},{"categories.identifier":1},function(err,foundCategories){			
			if(err){
				res.json({data:{status:"5",data:{}}});
			}else{
				if(foundCategories && "categories" in foundCategories){

					//var catArray = _.pluck(foundCategories.categories,'identifier')
					var result = {data:{categories:[]}};

					//Get The sites by Each Category
					var categoriesProcessed = 0;
					//Order the sites by Category Identifier
					for(var i=0; i< foundCategories.categories.length;i++){
						//var categorySites = _.where(sitesCategories.sites, {categories});

						//Return the sites by Categories
						organization.find({'sites.categories.identifier':{$in:foundCategories.categories[i].identifier}},{"_id":0,"sites.identifier":1},function(err,sitesCategories){
							categoriesProcessed++;
							if(err)
								res.json({data:{status:"5",data:{}}});
							else
							{
								var allSites = _.pluck(sitesCategories,"sites");
								result.categories.push({"identifier":foundCategories.categories[i].identifier, sites:allSites});

								//Return the categories if all is processed
								if(categoriesProcessed===foundCategories.categories.length){
									result.status=0;
									res.json(result);
								}
							}

						});						
					}					

				}else{
					res.json({data:{status:"9",data:{}}});	
				}
			}
		});
	}

	return functions;
}