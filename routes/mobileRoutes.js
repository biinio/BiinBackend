module.exports =function(){
	var fs=require('fs');
	var functions ={};

	//GET Categories
	functions.getCategories=function(req,res){
		var jsonObj= fs.readFileSync("./public/workingFiles/biinFakeJsons/getCategories.json", "utf8");		
		res.json(JSON.parse(jsonObj));
	}

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
	return functions;
}