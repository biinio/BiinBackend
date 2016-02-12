module.exports = function () {
	var math = require('mathjs');
	var ratingSites = require('../schemas/ratingSites');
	var organization = require('../schemas/organization');
	var _= require('underscore');
	var utils = require('../biin_modules/utils')();

	var functions = {};

	functions.putRating = function(req, res){
		var reqData = req.body.model;
		var siteId = reqData.siteId;
		var userId = reqData.userId;
		var rating = reqData.rating;
		var comment = reqData.comment;
		var date = Date.now();

		var objectToSave = {};

		objectToSave.identifier = utils.getGUID();
		objectToSave.siteIdentifier = siteId;
		objectToSave.userIdentifier = userId;
		objectToSave.rating = parseInt(rating);
		objectToSave.comment = comment;
		objectToSave.date = date;

		ratingSites.create(objectToSave, function (err, objectToSave) {
  		if (err)
				res.status(200).json({data:{},status:"1",result:"0"});
			else
				res.status(200).json({data:objectToSave,status:"0",result:"1"});
		});
	};

	functions.getRatings = function(req, res){
		var siteId = req.headers["siteid"];

		ratingSites.find({siteIdentifier:siteId},{}, function (err, ratings) {
  		if (err)
				res.status(200).json({data:{},status:"1",result:"0"});
			else
				res.status(200).json({data:ratings,status:"0",result:"1"});
		});
	};

	functions.getRatingsByOrganization = function(req, res){
		var organizationid = req.headers["organizationid"];
		if(organizationid){
			organization.findOne({identifier:organizationid},{"sites.identifier":1,"sites.isDeleted":1},function(errOrg, orgData){
				if(errOrg)
					res.status(200).json({data:{},status:"1",result:"0"});
				else{
					var sitesId = [];
					for(var i = 0; i < orgData.sites.length; i++){
						if(!orgData.sites[i].isDeleted){
							sitesId.push(orgData.sites[i].identifier)
						}
					}
					ratingSites.find({siteIdentifier:{$in:sitesId}},{}, function (err, ratings) {
						if (err)
							res.status(200).json({data:{},status:"1",result:"0"});
						else
							res.status(200).json({data:ratings,status:"0",result:"1"});
					});
				}
			});
		} else{
			res.status(200).json({data:{},status:"1",result:"0"});
		}
	};

	return functions;
};
