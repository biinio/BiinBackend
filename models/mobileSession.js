//Mobile User Session
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var mobileUserSchema=new Schema({
	identifier:{type:String,index:true},
	lastLocation:{type:[Number],index:"2dsphere"},
  sitesSent:[
    {identifier:{type:String}}
  ],
  elementsSent:[
    {identifier:{type:String}}
  ],
	elementsSentByCategory : [
		{
			identifier:{type:String},
			elementsSent :{ type:[String]	}
		}
	],
  organizatonsSent:[
    {identifier:{type:String}}
  ],
  showcasesSent:[
    {
      identifier:{type:String},
      elements:{
        identifier:{type:String}
      }
    }
  ],
  elementsAvailable:[
    {
      identifier:{type:String},
      categories:[
        {identifier:{type:String}}
      ]
    }
  ],
  lastrequest:{type:Date, default:Date.now()}
});

module.exports = mongoose.model('mobileSession', mobileUserSchema);
