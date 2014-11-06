var moongose = require('mongoose');

module.exports = moongose.model('categories',{
			identifier:{type:String, index:true, default:"-1"},
			name:{type:String, default:""},
			displayName:{type:String, default:""},
			icon:{type:String, default:""}
});