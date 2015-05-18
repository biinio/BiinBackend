module.exports = function () {
	//Custom Utils
	var utils = require('../biin_modules/utils')();
	var util = require('util');

	//Schemas
	var organization = require('../schemas/organization'); 
	//var site = require('../schemas/site');
	//var biin = require('../schemas/biin');
	//var regionRoutes = require('./regions')();

	var functions={};

	//GET the main view of sites
	functions.index = function(req,res)
	{
		res.render('maintenance/index', { title: 'Maintenance' , user:req.user, isSiteManteinance:true});
	}

	//GET the list of organizations
	functions.getOrganizationInformation = function(req,res){	
		res.setHeader('Content-Type', 'application/json');	
		organization.find({},{_id:0,identifier:1,name:1,brand:1,description:1,extraInfo:1,media:1,biins:1,biinsCounter:1,majorCounter:1,sites:1,purchasedBiinsHist:1}).lean().exec(function (err, data) {
			var organizations = data;
			for (var i = 0; i < organizations.length ; i++)
			{

				if(organizations[i].purchasedBiinsHist == null)
					organizations[i].purchasedBiinsHist = [];
					
				if(organizations[i].biinsCounter == null)
					organizations[i].biinsCounter = 0;
				
				organizations[i].unassignedBeacons = organizations[i].purchasedBiinsHist.length - organizations[i].biinsCounter;
			}
			res.json(organizations);
		});
	}

	return functions;
}
