module.exports = function () {
	var math = require('mathjs');
	var ratingSites = require('../schemas/ratingSites');
	var _= require('underscore');

	var functions = {};

	functions.putRating = function(req, res){
		res.status(200).json({data:{},status:"0",result:"1"});
	}
	functions.getRatings = function(req, res){
		res.status(200).json({data:[]});
	}

	return functions;
}
