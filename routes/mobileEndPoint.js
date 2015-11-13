module.exports = function(){

  var util = require('util'), fs=require('fs');
  var _= require('underscore');
  var utils = require('../biin_modules/utils')();

  var initialDataJson = require('../config/initialData.json');
  var organization = require('../schemas/organization');
  //Schemas
	var client = require('../schemas/client');

  var functions ={}

  functions.getInitialData = function(req, res){
    var userIdentifier = req.param("biinieId");
    var userLat = eval(req.param("latitude"));
    var userLng = eval(req.param("longitude"));
    var MAX_SITES = 20;
    var response = {};
    organization.aggregate([{ $unwind: "$sites"},{ $project: { 'organizationId':'$identifier', 'site':'$sites' } }],function(error,data){
      for (var i = 0; i < data.length; i++) {
        data[i].site.proximity = utils.getProximity(userLat,userLng,data[i].site.lat,data[i].site.lng);
      }
      var sortByProximity = _.sortBy(data,function(site){
        return site.site.proximity;
      });
      var sitesReducedAndSorted = sortByProximity.splice(0,MAX_SITES);
      var sites = [];
      for (i = 0; i < sitesReducedAndSorted.length; i++) {
        sites.push(sitesReducedAndSorted[i].site);
      }
      response.sites = sites;
      var organizationsToFind = [];
      for (i = 0; i < sitesReducedAndSorted.length; i++) {
        organizationsToFind.push(sitesReducedAndSorted[i].organizationId)
      }
      organizationsToFind = _.uniq(organizationsToFind);


      organization.find({identifier:{$in : organizationsToFind}},{},function(error,orgData){
        if(error)
          throw error;
        var organizations = [];
        for (var i = 0; i < orgData.length; i++) {
          organizations.push(orgData[i]);
        }
        response.organizations = organizations;
        res.json(response);

      })



    });
  }

	return functions;
}
