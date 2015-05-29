module.exports = function () {
	//Custom Utils
	var utils = require('../biin_modules/utils')();
	var util = require('util');

	//Schemas
	var organization = require('../schemas/organization'); 
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
		organization.find({},{_id:0,identifier:1,biinsAssignedCounter:1,accountIdentifier:1,name:1,brand:1,description:1,extraInfo:1,media:1,biins:1,biinsCounter:1,majorCounter:1,sites:1,purchasedBiinsHist:1}).lean().exec(function (err, data) {
			var organizations = data;
			res.json(organizations);
		});
	}

	//GET the list of beacon per organization
	functions.getBiinsOrganizationInformation = function(req,res){	
		res.setHeader('Content-Type', 'application/json');
		var orgId = req.params['orgIdentifier'];	
		biins.find({organizationIdentifier:orgId},{_id:0,identifier:1,name:1,major:1,minor:1,proximityUUID:1,status:1,isAssigned:1,organizationIdentifier:1,siteIdentifier:1}).lean().exec(function (err, data) {
			var biins = data;
			res.json(biins);
		});
	}

	functions.addBiinToOrganizationModal = function(req,res){
		res.render('maintenance/addBiinToOrganizationModal');
	}

	functions.biinPurchase = function(req,res){
		res.setHeader('Content-Type', 'application/json');
		var beacon = req.body;
		var orgID = beacon.organizationIdentifier;
		var siteIndex = beacon.siteIndex;
		var siteLocationToUpdate = "sites."+siteIndex+".minorCounter";
		delete beacon.siteIndex;
		var mode = beacon.mode;
		delete beacon.mode;

		var newMinor = beacon.minor;

		var setQuery = {};
		var incQuery = {};
		setQuery[siteLocationToUpdate] = newMinor;
		if(mode == "create")
		{
			incQuery["biinsAssignedCounter"] = 1;
			incQuery["biinsCounter"]=1;
			biins.create(beacon,function (error,data){
				if(error == null){
					organization.update({identifier:orgID},{ $inc: incQuery, $set:setQuery}, function(errorUpdate, data){
						if(errorUpdate == null){
							return res.send("{\"success\":\"true\"}",200);
						}
						else{
							return res.send("{\"success\":\"false\"}",500);
						}
					});
				}
				else
				{
					return res.send("{\"success\":\"false\"}",500);
				}
			});
		}
		else
		{
			biins.update({identifier:beacon.identifier},{$set:beacon},function (error,data)
			{
				if(error == null)
				{
					organization.update({identifier:orgID},{ $set:setQuery}, function(errorUpdate, data)
					{
						if(errorUpdate == null){
							return res.send("{\"success\":\"true\"}",200);
						}
						else{
							return res.send("{\"success\":\"false\", \"message\":\"Update organization info failed.\"}",500);
						}
					});
				}
			});
		}
	}

	return functions;
}
