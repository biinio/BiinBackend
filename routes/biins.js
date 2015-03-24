module.exports = function () {

	var util = require('util');
	var region = require('../schemas/region'), 
	    biins = require('../schemas/biin'),
	    organization = require('../schemas/organization');


	var _ = require('underscore');
	var functions = {};
	var utils = require('../biin_modules/utils')();
    
    //GET the list of biins
	functions.list = function(req,res){
		biins.find({},function (err, data) {
			   res.json({data:data});
		});		
	}

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
		
		organization.find({accountIdentifier:userAccount,identifier:organizationId,'sites.biins': { "$gt": {} }},{'_id':0, 'sites.identifier':1, 'sites.title1':1,'sites.title2':2, 'sites.media':1,'sites.biins':1},function(err,data){
			if(err)
				throw err;
			else{
					if(data[0])
						res.json({data:data[0].sites})
					else
						res.json({})
				}
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

	return functions;
}