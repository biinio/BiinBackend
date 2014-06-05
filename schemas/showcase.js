var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var showcaseSchema = new Schema( {
	customerId: String,
	organizationId: String,
	identifier:{ type: String, index: true },
	type:String,
	title:String,
	title2:String,
	title3:String,
	titleColor:String,
	titleColor2:String,
	titleColor3:String,
	titleSize:String,
	titleSize2:String,
	titleSize3:String,
	showcaseDescription:String,
	theme:String,
	mainImageUrl:[
		{
			value:String
		}
	],
	objects:[
		{
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

		}
	]
});

module.exports = mongoose.model('showcases', showcaseSchema);