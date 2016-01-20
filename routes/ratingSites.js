module.exports = function () {
	var math = require('mathjs');
	var ratingSites = require('../schemas/ratingSites');
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

	}
	functions.getRatings = function(req, res){
		var siteId = req.headers["siteid"];

		ratingSites.find({siteIdentifier:siteId},{}, function (err, ratings) {
  		if (err)
				res.status(200).json({data:{},status:"1",result:"0"});
			else
				res.status(200).json({data:ratings,status:"0",result:"1"});
		});
	}

	return functions;
}
