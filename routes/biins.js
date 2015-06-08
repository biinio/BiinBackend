 module.exports = function () {

 	//Custom Utils
	var util = require('util');
	var region = require('../schemas/region'), 
	    biins = require('../schemas/biin'),
	    organization = require('../schemas/organization'),
	    routesUtils = require('../biin_modules/routesUtils')();

	var _ = require('underscore');
	var functions = {};
	var utils = require('../biin_modules/utils')();

    //GET the View of Biins
	functions.index = function(req,res){
		var orgIdentifier= req.param('identifier');
		var identifier=req.param("identifier");

		var callback=function (org,req,res) {
			res.render('biins/index', { title: 'Biins list' , user:req.user, organization:org, isSiteManteinance:true});
		}

		//getOganization
		routesUtils.getOrganization(identifier,req,res,{name:true, identifier:true},callback)
	}
    
    //GET the list of biins
	functions.list = function(req,res){

		var orgIdentifier= req.param('identifier');
		biins.find({accountIdentifier:req.user.accountIdentifier,organizationIdentifier:orgIdentifier},function (err, data) {
			   res.json({data:data});
		});

	}

	//Deprecated
	//GET the list of biisn by regions
	functions.listJson = function(req,res){
		var regionParam = req.param('region');
		region.findOne({identifier:regionParam},'biins',function (err, data) {
			   res.json({"data":data});
		});		
	}

	//GET the biins by organization Identifier
	functions.getByOrganization=function(req,res){
		var organizationId = req.param('identifier');
		var userAccount = req.user.accountIdentifier;
		
		var orgIdentifier= req.param('identifier');
		biins.find({accountIdentifier:req.user.accountIdentifier,organizationIdentifier:organizationId},function (err, data) {
			   res.json({data:data});
		});
	}

	//POST Update the biins of the specific sites
	functions.updateSiteBiins=function(req,res){
		var organizationId = req.param('identifier');
		var userAccount = req.user.accountIdentifier;

		//Update the sites biins inside the organization
		organization.findOne({accountIdentifier:userAccount, identifier:organizationId},function(err,doc){
			//Modify the site
			var countOfChanges =0;
			var date = utils.getDateNow();
			for(var siteIndex=0; siteIndex< req.body.length; siteIndex++){
				var siteToWorkDocument =_.find(doc.sites,function(siteDoc){
								return siteDoc.identifier == req.body[siteIndex].identifier;
							 });

				//If the site to work is not null
				if(siteToWorkDocument){
					var biins = req.body[siteIndex].biins;						
					for(var biinIndex=0; biinIndex< biins.length; biinIndex++){

						var biinToUpdate = _.find(siteToWorkDocument.biins,function(biinDoc){
							return biinDoc._id == biins[biinIndex]._id ;
						})

						if(biinToUpdate){
							//var showcaseToAsign = '';
						    //if('showcaseAsigned' in biins[biinIndex])
						    //	showcaseToAsign = biins[biinIndex].showcasesAsigned;

						   biinToUpdate.showcases= biins[biinIndex].showcases;
						   biinToUpdate.lastUpdate=date;
						   countOfChanges++;
						}
					}
				}
			}	
			//Save the modifications
			if(countOfChanges>0)
				doc.save();
		});
		res.json({state:'success'});	
	}

	//Set the objects of a Biin
	functions.setObjects=function(req,res){
		var organizationIdentifier= req.param('identifier');
		var biinIdentifier =req.param('biinIdentifier');
		var model = req.body.model;

		biins.findOne({identifier:biinIdentifier,organizationIdentifier:organizationIdentifier},function(err,biinData){
			if(err)
				res.send(err, 500);
			else{

				//If the biin data is correct
				if(biinData){
					biinData.objects = model.objects;
					biinData.save(function(err,cantAffected){
						if(err)								
							res.send(err, 500);
						else
							res.json({data:biinData.objects});
					});
				}
				else
					res.send(err, 500);
			}
		});
	}


	//Set the objects of a Biin
	functions.updateBiin=function(req,res){
		var organizationIdentifier= req.param('identifier');
		var biinIdentifier =req.param('biinIdentifier');
		var biin = req.body;

		biins.update({identifier:biinIdentifier},{$set:biin},function (error,data)
		{
			if(error == null){
				return res.send("{\"success\":\"true\"}",200);
			}else{
				return res.send("{\"success\":\"false\", \"message\":\"Update biin info failed.\"}",500);
			}
		});
	}


	return functions;
}