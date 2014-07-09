module.exports = function () {
	var functions={};

	//Schemas
	var site = require('../schemas/site');

	functions.list=function(req,res){
		var identifier = req.param("identifier");
		site.find({"accountIdentifier":req.user.accountIdentifier,"organizationIdentifier":identifier},function (err, data) {
			   res.json({data:data, prototypeObj : new site()});
		});		
	}

	return functions;
}
