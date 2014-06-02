var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var elementSchema = new Schema({
	objectId:String,
	number:String,
	type:{type:String},
	likes:String,
	title:String,
	objectDescription:[
		{
			value:String
		}
	],
	actionType:String,
	originalPrice:String,
	biinPrice:String,
	discount:String,
	savings:String,
	biinSold:String,
	timeFrame:String,
	imageUrl:[
		{
			value:String
		}
	],
	theme:String,
	categories:[
		{
			category:String
		}
	]

});

module.exports = mongoose.model('elements', elementSchema);