module.exports = function () {
	var showcase = require('../schemas/showcase');
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

	return functions;
}