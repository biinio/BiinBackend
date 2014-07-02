module.exports = function () {
	var functions={};
	//Schemas
	var site = require('../schemas/sites');

	functions.list=function(req,res){
		var identifier = req.param("identifier");
		site.find({"accountIdentifier":req.user.accountIdentifier,"identifier":identifier},function (err, data) {
			   res.json({data:data, prototypeObj : new site()});
		});		
	}
}
