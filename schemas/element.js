var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var elementSchema = new Schema({
    objectIdentifier:{type:String, default:"-1"},
    position:{type:String, default:""},
	objectType:{type:String, default:""},
	likes:{type:String, default:""},
    title1:{type:String, default:""},
	title2:{type:String, default:""},
	title1Color:{type:String, default:""},
	title2Color:{type:String, default:""},
	title1Size:{type:String, default:""},
	title2Size:{type:String, default:""},
	objectDescription:{type:String, default:""},
	actionType:{type:String, default:""},
	originalPrice:{type:String, default:""},
	biinPrice:{type:String, default:""},
	discount:{type:String, default:""},
	savings:{type:String, default:""},
	biinSold:{type:String, default:""},
	timeFrame:{type:String, default:""},
	imageUrl:{type:String, default:""},
	categories:[]

});

module.exports = mongoose.model('elements', elementSchema);