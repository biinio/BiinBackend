module.exports = function () {
	var category = require('../schemas/category');	
	var functions = {};

    //GET the list of biins
	functions.list = function(req,res){
		category.find({},function (err, data) {
			   res.json({data:data});
		});		
	}

	return functions;
}