var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var elementSchema = new Schema({
    objectIdentifier:String,
    position:Number,
	type:{type:Number},
	likes:String,
    title1:String,
	title2:String,
	title1Color:String,
	title2Color:String,
	title1Size:String,
	title2Size:String,
	objectDescription:String,
	actionType:Number,
	originalPrice:String,
	biinPrice:String,
	discount:String,
	savings:String,
	biinSold:String,
	timeFrame:String,
	imageUrl:String,
	categories:[]

});

module.exports = mongoose.model('elements', elementSchema);