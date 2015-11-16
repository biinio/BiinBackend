module.exports = function(){

  var util = require('util'), fs=require('fs');
  var _= require('underscore');
  var utils = require('../biin_modules/utils')();

  var initialDataJson = require('../config/initialData.json');
  var organization = require('../schemas/organization'),
    showcase = require('../schemas/showcase');
  //Schemas
	var client = require('../schemas/client');

  var functions ={}

  functions.getInitialData = function(req, res){
    var userIdentifier = req.param("biinieId");
    var userLat = eval(req.param("latitude"));
    var userLng = eval(req.param("longitude"));
    var MAX_SITES = 20;
    var response = {};
    var organizations = [];
    var elements = [];
    var highlights = [];
    var categories = [];
    var sites = [];
    organization.find({},
      {
        'identifier':1,
        'sites.identifier':1,
        'sites.organizationIdentifier':1,
        'sites.proximityUUID':1,
        'sites.major':1,
        'sites.country':1,
        'sites.state':1,
        'sites.city':1,
        'sites.zipCode':1,
        'sites.ubication':1,
        'sites.title':1,
        'sites.subTitle':1,
        'sites.streetAddress1':1,
        'sites.latitude':1,
        'sites.longitude':1,
        'sites.email':1,
        'sites.nutshell':1,
        'sites.phoneNumber':1,
        'sites.media.mediaType':1,
        'sites.media.url':1,
        'sites.media.vibrantColor':1,
        'sites.media.vibrantDarkColor':1,
        'sites.media.vibrantLightColor':1,
        'sites.neighbors':1,
        'sites.showcases':1,
        'sites.biins':1,
        'sites.categories':1
       } ,function(error,data){
      var sitesDesnormalized = [];
      for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].sites.length; j++) {
          sitesDesnormalized.push({organizationId:data[i].identifier,site :data[i].sites[j]});
        }
      }

      for (var i = 0; i < sitesDesnormalized.length; i++) {
        sitesDesnormalized[i].site.proximity = utils.getProximity(userLat,userLng,sitesDesnormalized[i].site.lat,sitesDesnormalized[i].site.lng);
      }
      var sortByProximity = _.sortBy(sitesDesnormalized,function(site){
        return site.site.proximity;
      });
      var sitesReducedAndSorted = sortByProximity.splice(0,MAX_SITES);
      for (i = 0; i < sitesReducedAndSorted.length; i++) {
        sites.push(sitesReducedAndSorted[i].site);
      }
      response.sites = sites;

      var  elementsInShowcase = [];

      var showcasesToFind = [];
      for (i = 0; i < response.sites.length; i++) {
        for (var j = 0; j < response.sites[i].showcases.length; j++) {
          showcasesToFind.push(response.sites[i].showcases[j].showcaseIdentifier);
          elementsInShowcase = elementsInShowcase.concat(response.sites[i].showcases[j].elements);
        }
      }

      var uniqueElementsShowcase = [];
      for (var i = 0; i < elementsInShowcase.length; i++) {
        uniqueElementsShowcase.push(elementsInShowcase[i].identifier);
      }
      uniqueElementsShowcase = _.uniq(uniqueElementsShowcase);

      showcasesToFind = _.uniq(showcasesToFind);
      showcase.find({identifier : {$in : showcasesToFind}},
        {
          "title":1,
          "subTitle":1,
          "identifier":1
        },
        function(showcasesError, showcasesData){
          if(showcasesError)
            throw showcasesError;

          var organizationsToFind = [];
          for (i = 0; i < sitesReducedAndSorted.length; i++) {
            organizationsToFind.push(sitesReducedAndSorted[i].organizationId)
          }
          organizationsToFind = _.uniq(organizationsToFind);
          organization.find({identifier:{$in : organizationsToFind}},
            {
              "identifier": 1,
              "_id": 1,
              "media": 1,
              "extraInfo": 1,
              "description": 1,
              "brand": 1,
              "name": 1,
              "isLoyaltyEnabled": 1,
              "loyalty": 1,
              "elements": 1
            },function(error,orgData){
              if(error)
                throw error;

              for (var i = 0; i < orgData.length; i++) {
                elements = elements.concat(orgData[i].elements);
                delete orgData[i].elements;
                organizations.push(orgData[i]);
              }
              //TODO: Search by the uniqueElementsShowcase and delete the item from that array when the element item is obtained
              //(would be at least same elements or less than elements array)
              var elementsfiltered = [];
              elementsfiltered = _.filter(elements, function(element){
                return uniqueElementsShowcase.indexOf(element.elementIdentifier) > -1;
              });

              var elementWithCategories = [];
              for (var i = 0; i < elementsInShowcase.length; i++) {

                var element =  elementsInShowcase[i];
                elementData = _.findWhere(elementsfiltered,{elementIdentifier:element.identifier})
                element.categories = elementData.categories;
                elementWithCategories.push(element);
              }


              //Fill highlights array
              var highlightsWithID = [];
              for (var i = 0; i < elementsfiltered.length; i++) {
                if(elementsfiltered[i].isHighlight=="1"){
                  highlights.push(elementsfiltered[i].elementIdentifier);
                }
              }

              var hightlightsFiltered = _.filter(elementsInShowcase,function(element){
                return highlights.indexOf(element.identifier) > -1;
              });




              //Fill categories array
              var elementsCategories = [];
              for (var i = 0; i < elementsfiltered.length; i++) {
                elementsCategories = elementsCategories.concat(elementsfiltered[i].categories);
              }
              var uniqueCategories = [];
              for (i = 0; i < elementsCategories.length; i++) {
                uniqueCategories.push(elementsCategories[i].identifier);
              }
              uniqueCategories = _.uniq(uniqueCategories);

              for (var i = 0; i < uniqueCategories.length; i++) {

                var elementsWithCategories = _.filter(elementWithCategories,function(element){
                  return _.find(element.categories,function(category){
                    return uniqueCategories[i] == category.identifier;
                  }) != null;
                });

                categories.push({identifier:uniqueCategories[i], elements:elementsWithCategories});

              }

              response.organizations = organizations;
              response.elements = elementsfiltered;
              response.highlights = hightlightsFiltered;
              response.categories = categories;
              res.json({data:response,status: "0",result: "1"});
        })
      });



    });
  }

	return functions;
}
