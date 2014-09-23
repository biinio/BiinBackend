var moongose = require('mongoose');

module.exports = moongose.model('biins',{
			identifier:{type:String, index:true, Default:""},
			name:{type:String, Default:""},
			major:{type:String, Default:""},
			minor:{type:String, Default:""},
			proximityUUID:{type:String, Default:""},
			location:{type:String, Default:""},
			registerDate:{type:String, Default:""},
			showcaseAsigned:{type:String, Default:""}
});

