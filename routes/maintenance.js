module.exports = function () {
	//Custom Utils
	var utils = require('../biin_modules/utils')();
	var util = require('util');

	//Schemas
	var organization = require('../schemas/organization'); 
	var site = require('../schemas/site');
	var biins = require('../schemas/biin');
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
				var biinsInTheOrganization = [];
				biins.find({organizationIdentifier:organizations[i].identifier}, {_id:0,identifier:1,name:1,major:1,minor:1,proximityUUI:1,location:1,state:1,isAssigned:1,organizationIdentifier:1,siteIdentifier:1}).lean().exec(function(err,data){
					 biinsInTheOrganization = data
				})
				
				var assignedBeaconsCounter = 0;
				for(var j=0; j<biinsInTheOrganization.length;j++)
				{
					var siteData = null;
					site.find({identifier:biinsInTheOrganization[j].identifier},{_id:0,identifier:1,title1:1,title2:1}).lean().exec(function(err,data){
						siteData = data;
					})
					if(biinsInTheOrganization[j].isAssigned)
						assignedBeaconsCounter++;

					biinsInTheOrganization[j].siteData = siteData;
				}

				organizations[i].biins = biinsInTheOrganization;
				organizations[i].unassignedBeacons = organizations[i].biins.length- assignedBeaconsCounter;
				organizations[i].assignedBeacons = assignedBeaconsCounter;
			}
			res.json(organizations);
		});
	}

	functions.addBiinToOrganizationModal = function(req,res){
		res.render('maintenance/addBiinToOrganizationModal');
	}

	return functions;
}
