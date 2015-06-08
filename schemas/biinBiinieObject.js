var moongose = require('mongoose');

module.exports = moongose.model('biinBiinieObject',{
			biinieIdentifier:{type:String, index:true},
			biinIdentifier:{type:String,index:true},
			objectIdentifier:{type:String,index:true},
			isNotified:{type:String},
			notifiedTime:{type:String},
			isBiined:{type:String},
			biinedTime:{type:String}
});