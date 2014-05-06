module.exports = function () {
	var functions = {};

	functions.index = function(req,res){
		res.render('showcase/index', { title: 'Organizations list' ,user:req.user});
	}

	return functions;
}