module.exports =function(db){
	var functions ={};

	functions.index = function(req,res){
		res.render('organization/index', { title: 'Organizations list' ,user:req.user});
	}	
	return functions;
}