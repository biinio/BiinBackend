var mongoose = require('mongoose');

module.exports = mongoose.model('showcases', {
	customerId: String,
	organizationId: String,
	identifier:{ type: String, index: true },
	type:String,
	title:String,
	showcaseDescription:String,
	theme:String,
	categories:[
		{
			category:String
		}
	],
	phoneNumbers:[
		{
			phoneNumber:String
		}
	],
	address:[
		{
			country:String,
			state:String,
			town:String,
			zipCode:String,
			street:String	
		}
	],
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