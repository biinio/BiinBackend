module.exports = function(){

  var util = require('util'), fs=require('fs');
  var _= require('underscore');
  var utils = require('../biin_modules/utils')();

  var initialDataJson = require('../config/initialData.json');
  var elementsJson = require('../config/elements.json');

  //Schemas
  var organization = require('../schemas/organization'),
    showcase = require('../schemas/showcase');
  var mobileUser = require('../schemas/mobileUser');
  var mobileSession = require('../schemas/mobileSession');
	var client = require('../schemas/client');

  // Default image for elements
  var BIIN_DEFAULT_IMAGE = {
      domainColor: '170, 171, 171',
      mediaType: '1',
      title1: 'default',
      url: 'https://biinapp.blob.core.windows.net/biinmedia/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/media/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/4e8b2fb3-af89-461d-9c37-2cc667c20653/media/4af24d51-2173-4d41-b651-d82f18f00d1b.jpg',
      vibrantColor: '170, 171, 171',
      vibrantDarkColor: '85,86,86',
      vibrantLightColor: '170, 171, 171'
  };
  var functions ={}

  function validateSiteInitialInfo(site){
    var siteValidated = {};
    siteValidated.identifier = site.identifier ? site.identifier : "";
    siteValidated.organizationIdentifier = site.organizationIdentifier ? site.organizationIdentifier : "";
    siteValidated.proximityUUID = site.proximityUUID ? site.proximityUUID : "";
    siteValidated.major = site.major ? site.major + "" : "";
    siteValidated.country = site.country ? site.country : "";
    siteValidated.state = site.state ? site.state : "";
    siteValidated.city = site.city ? site.city : "";
    siteValidated.zipCode = site.zipCode ? site.zipCode : "";
    siteValidated.ubication = site.ubication ? site.ubication : "";
    siteValidated.title = site.title1 ? site.title1 : "";
    siteValidated.subTitle = site.title2 ? site.title2 : "";
    siteValidated.streetAddress1 = site.streetAddress1 ? site.streetAddress1 : "";
    siteValidated.latitude = site.lat ? site.lat : "0";
    siteValidated.longitude = site.lng ? site.lng : "0";
    siteValidated.email = site.email ? site.email : "";
    siteValidated.nutshell = site.nutshell ? site.nutshell : "";
    siteValidated.phoneNumber = site.phoneNumber ? site.phoneNumber : "";
    siteValidated.media = site.media && site.media.length != 0 ? site.media : [BIIN_DEFAULT_IMAGE];
    siteValidated.neighbors= site.neighbors ? site.neighbors : [];
    siteValidated.showcases= site.showcases ? site.showcases : [];
    siteValidated.biins= site.biins ? site.biins : [];
    siteValidated.userShared= site.userShared ? site.userShared : "0";
    siteValidated.userFollowed= site.userShared ? site.userFollowed : "0";
    siteValidated.userLiked= site.userShared ? site.userLiked : "0";

    return siteValidated;
  }

  function validateOrganizationInitialInfo(organization){

    var organizationValidated = {};
    organizationValidated.identifier= organization.identifier? organization.identifier : "";
    organizationValidated._id= organization._id?organization._id : "";
    organizationValidated.media = organization.media && organization.media.length != 0? organization.media : [BIIN_DEFAULT_IMAGE];
    organizationValidated.extraInfo = organization.extraInfo?organization.extraInfo : "";
    organizationValidated.description = organization.description?organization.description : "";
    organizationValidated.brand = organization.brand?organization.brand : "";
    organizationValidated.name = organization.name?organization.name : "";
    organizationValidated.isLoyaltyEnabled = organization.isLoyaltyEnabled?organization.isLoyaltyEnabled : "0";
    organizationValidated.loyalty = organization.loyalty? organization.loyalty : [];

    return organizationValidated;
  }

  function validateElementInitialInfo(element){
    var elementValidated = {};
    elementValidated._id = element._id? element._id : "";
    elementValidated.identifier = element.elementIdentifier? element.elementIdentifier : "";
    elementValidated.sharedCount = element.sharedCount? element.sharedCount : "0";
    elementValidated.categories = element.categories? element.categories : [];
    elementValidated.quantity = element.quantity? element.quantity : "";
    elementValidated.hasQuantity = element.hasQuantity? "1" : "0";

    elementValidated.expirationDate = element.expirationDate? element.expirationDate : "";
    elementValidated.expirationDate = elementValidated.expirationDate == "" ? utils.getDateNow() : utils.getDate(elementValidated.expirationDate);

    elementValidated.initialDate = element.initialDate? element.initialDate : "";
    elementValidated.initialDate = elementValidated.initialDate == "" ? utils.getDateNow() : utils.getDate(elementValidated.initialDate);

    elementValidated.hasTimming = element.hasTimming? element.hasTimming : "0";
    elementValidated.savings = element.savings? element.savings : "";
    elementValidated.hasSaving = element.hasSaving? element.hasSaving : "0";
    elementValidated.discount = element.discount? element.discount : "";
    elementValidated.hasDiscount= element.hasDiscount? element.hasDiscount : "0";
    elementValidated.isHighlight= element.isHighlight? element.isHighlight : "0";

    //In the database is returned like a number
    elementValidated.price = element.price? element.price+"" : "0";

    elementValidated.hasPrice = element.hasPrice? element.hasPrice : "0";
    elementValidated.listPrice = element.listPrice? element.listPrice : "";
    elementValidated.hasListPrice = element.hasListPrice? element.hasListPrice : "0";
    elementValidated.hasFromPrice = element.hasFromPrice? element.hasFromPrice : "0";
    elementValidated.currencyType = element.currencyType? element.currencyType : "1";
    elementValidated.searchTags = element.searchTags? element.searchTags : [];
    elementValidated.subTitle= element.subTitle? element.subTitle : "";
    elementValidated.title = element.title? element.title : "";

    //In the database is returned like a number
    elementValidated.collectCount= element.collectCount? element.collectCount +"" : "0";

    elementValidated.detailsHtml= element.detailsHtml? element.detailsHtml : "";
    elementValidated.reservedQuantity = element.reservedQuantity? element.reservedQuantity : "0";
    elementValidated.claimedQuantity = element.claimedQuantity? element.claimedQuantity : "0";
    elementValidated.actualQuantity = element.actualQuantity? element.actualQuantity : "0";
    elementValidated.media = element.media && element.media.length != 0? element.media : [BIIN_DEFAULT_IMAGE];

    //this fields need to be get from userHistory
    elementValidated.userShared = element.userShared? element.userShared : "0";
    elementValidated.userLiked = element.userLiked? element.userLiked : "0";
    elementValidated.userCollected = element.userCollected? element.userCollected : "0";
    elementValidated.userViewed = element.userViewed? element.userViewed : "0";
    return elementValidated;
  }

  functions.getInitialData = function(req, res){
    var userIdentifier = req.param("biinieId");
    var userLat = eval(req.param("latitude"));
    var userLng = eval(req.param("longitude"));
    var MAX_SITES = process.env.SITES_INITIAL_DATA || 10;
    var ELEMENTS_IN_CATEGORY = process.env.ELEMENTS_IN_CATEGORY || 7;
    var LIMIT_HIGHLIGHTS_TO_SENT = process.env.LIMIT_HIGHLIGHTS_TO_SENT || 6;
    var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
    var response = {};
    var organizations = [];
    var elements = [];
    var highlights = [];
    var categories = [];
    var sites = [];

    mobileUser.findOne({'identifier':userIdentifier},{'showcaseNotified':1, 'biinieCollections':1,'loyalty':1,"likeObjects":1, "followObjects":1, "biinieCollect":1, "shareObjects":1},function(errBiinie,mobileUserData){
      if(errBiinie)
        throw errBiinie;

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
          'sites.title1':1,
          'sites.title2':1,
          'sites.streetAddress1':1,
          'sites.lat':1,
          'sites.lng':1,
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
        }).lean().exec( function(error,data){

        var sitesDesnormalized = [];

        for (var i = 0; i < data.length; i++) {
          for (var j = 0; j < data[i].sites.length; j++) {
            sitesDesnormalized.push({organizationId:data[i].identifier,site :data[i].sites[j]});
          }
        }

        for (var i = 0; i < sitesDesnormalized.length; i++) {
          sitesDesnormalized[i].site.organizationIdentifier = sitesDesnormalized[i].organizationId;
          sitesDesnormalized[i].site.proximity = utils.getProximity(userLat,userLng,sitesDesnormalized[i].site.lat,sitesDesnormalized[i].site.lng);
        }
        var sortByProximity = _.sortBy(sitesDesnormalized,function(site){
          return site.site.proximity;
        });

        var sitesReducedAndSorted = sortByProximity.splice(0,MAX_SITES);
        for (i = 0; i < sitesReducedAndSorted.length; i++) {
          sites.push(sitesReducedAndSorted[i].site);
        }
        for (var i = 0; i < sites.length; i++) {

      		var userShare =_.findWhere(mobileUserData.shareObjects,{identifier:sites[i].identifier,type:"site"});
      		var userCollected =_.findWhere(mobileUserData.biinieCollections.sites,{identifier:sites[i].identifier});
      		var userFollowed =_.findWhere(mobileUserData.followObjects,{identifier:sites[i].identifier,type:"site"});
      		var userLiked =_.findWhere(mobileUserData.likeObjects,{identifier:sites[i].identifier,type:"site"});

      		sites[i].userShared = typeof(userShare)!=="undefined"?"1":"0";
      		sites[i].userFollowed = typeof(userFollowed)!=="undefined"?"1":"0";
      		sites[i].userCollected = typeof(userCollected)!=="undefined"?"1":"0";
      		sites[i].userLiked = typeof(userLiked)!=="undefined"?"1":"0";
        }


        response.sites = sites;

        var elementsInShowcase = [];
        var elementsRemovedFromShowcase = [];

        var showcasesToFind = [];
        for (i = 0; i < response.sites.length; i++) {
          for (var j = 0; j < response.sites[i].showcases.length; j++) {
            showcasesToFind.push(response.sites[i].showcases[j].showcaseIdentifier);
            response.sites[i].showcases[j].elements_quantity = response.sites[i].showcases[j].elements.length + "";
            var elementsToSend = response.sites[i].showcases[j].elements.splice(0,LIMIT_ELEMENTS_IN_SHOWCASE);
            elementsRemovedFromShowcase = elementsRemovedFromShowcase.concat(response.sites[i].showcases[j].elements);
            response.sites[i].showcases[j].elements = elementsToSend;
            elementsInShowcase = elementsInShowcase.concat(response.sites[i].showcases[j].elements);
          }
        }
        var uniqueElementsRemovedShowcase = _.pluck(elementsRemovedFromShowcase,'identifier');
        uniqueElementsRemovedShowcase = _.uniq(uniqueElementsRemovedShowcase);

        var uniqueElementsShowcase = _.pluck(elementsInShowcase,'identifier');
        /*for (var i = 0; i < elementsInShowcase.length; i++) {
          uniqueElementsShowcase.push(elementsInShowcase[i].identifier);
        }*/
        uniqueElementsShowcase = _.uniq(uniqueElementsShowcase);

        showcasesToFind = _.uniq(showcasesToFind);
        showcase.find({identifier : {$in : showcasesToFind}},
          {
            "name":1,
            "description":1,
            "identifier":1
          }).lean().exec(
          function(showcasesError, showcasesData){
            if(showcasesError)
              throw showcasesError;

            for (var i = 0; i < sites.length; i++) {
              for (var j = 0; j < sites[i].showcases.length; j++) {
                sites[i].showcases[j].identifier = sites[i].showcases[j].showcaseIdentifier;
                delete sites[i].showcases[j].showcaseIdentifier;

                var showcaseData = _.find(showcasesData,function(showcase){
                  return showcase.identifier == sites[i].showcases[j].identifier;
                })
                sites[i].showcases[j].title = showcaseData.name;
                sites[i].showcases[j].subTitle = showcaseData.description;
              }
            }

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
              }).lean().exec(function(error,orgData){
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

                var elementsAvailableForNextRequests = _.filter(elements, function(element){
                  return uniqueElementsRemovedShowcase.indexOf(element.elementIdentifier) > -1;
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

                hightlightsFiltered = hightlightsFiltered.splice(0,LIMIT_HIGHLIGHTS_TO_SENT);

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


                var elementsSentInCategories = [];

                for (var i = 0; i < uniqueCategories.length; i++) {

                  var elementsWithCategories = _.filter(elementWithCategories,function(element){
                    return _.find(element.categories,function(category){
                      return uniqueCategories[i] == category.identifier;
                    }) != null;
                  });

                  elementsWithCategories= elementsWithCategories.splice(0,ELEMENTS_IN_CATEGORY);
                  elementsSentInCategories = elementsSentInCategories.concat(elementsWithCategories);

                  categories.push({identifier:uniqueCategories[i], elements:elementsWithCategories});
                }

                for (var i = 0; i < elementsfiltered.length; i++) {

    							var isUserCollect = false;
    							for(var j=0; j<mobileUserData.biinieCollections.length & !isUserCollect;j++){
    								var elUserCollect =_.findWhere(mobileUserData.biinieCollections[j].elements,{identifier:elementsfiltered[i].identifier});
    								isUserCollect = elUserCollect != null;
    							}

    							var userShareElements = _.filter( mobileUserData.shareObjects, function(like){ return like.type === "element"});
    							var elUserShared =_.findWhere(userShareElements,{identifier:elementsfiltered[i].identifier})
    							var isUserShared = elUserShared != null;

    							var userLikeElements = _.filter( mobileUserData.likeObjects, function(like){ return like.type === "element"});
    							var elUserLike =_.findWhere(userLikeElements,{identifier:elementsfiltered[i].identifier})
                  var isUserLike = elUserLike != null;

    							var userFollowElements = _.filter( mobileUserData.followObjects, function(like){ return like.type === "element"});
    							var elUserFollow =_.findWhere(userFollowElements,{identifier:elementsfiltered[i].identifier})
                  var isUserFollow = elUserFollow != null;

    							var elUserViewed =_.findWhere(mobileUserData.seenElements,{elementIdentifier:elementsfiltered[i].identifier})
                  var isUserViewedElement = elUserViewed != null;

      						elementsfiltered[i].userShared=isUserShared?"1":"0";
      						elementsfiltered[i].userFollowed=isUserFollow?"1":"0";
      						elementsfiltered[i].userLiked=isUserLike?"1":"0";
      						elementsfiltered[i].userCollected=isUserCollect?"1":"0";
      						elementsfiltered[i].userViewed= isUserViewedElement?"1":"0";
                }
                var sitesSent = [];
                var organizationsSent = [];
                var elementsSent = [];
                for (var i = 0; i < response.sites.length; i++) {
                  response.sites[i]=validateSiteInitialInfo(response.sites[i]);
                  sitesSent.push({identifier:response.sites[i].identifier});
                }
                for (var i = 0; i < organizations.length; i++) {
                  organizations[i]=validateOrganizationInitialInfo(organizations[i]);
                  organizationsSent.push({identifier:organizations[i].identifier});
                }
                for (var i = 0; i < elementsfiltered.length; i++) {
                  elementsfiltered[i] = validateElementInitialInfo(elementsfiltered[i]);
                  elementsSent.push({identifier:elementsfiltered[i].identifier});
                }

                response.organizations = organizations;
                response.elements = elementsfiltered;
                response.highlights = hightlightsFiltered;
                response.categories = categories;
                res.json({data:response,status: "0",result: "1"});

                mobileSession.findOneAndUpdate(
                  {identifier:userIdentifier},
                  {
                    $set : {
                      sitesSent:response.sites,
                      elementsSent: elementsfiltered,
                      organizatonsSent : organizations,
                      elementsAvailable : elementsAvailableForNextRequests
                    }
                  },
                  {upsert: true}, // insert the document if it does not exist
                  function(error,data){
                    if(error)
                      throw error;

                  });
          })
        });
      });

    })

  }

  functions.getNextElementInShowcase = function(req,res){
    //res.json(elementsJson);
    var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
    var userIdentifier = req.param("identifier");
    var siteId = req.param('siteIdentifier');
    var showcaseID = req.param('showcaseIdentifier');
    var batchNumber = req.param('batch');
    var startElements = (batchNumber-1) * LIMIT_ELEMENTS_IN_SHOWCASE;
    var endElements = LIMIT_ELEMENTS_IN_SHOWCASE;
    var elements = [];
    mobileUser.findOne({'identifier':userIdentifier},{'showcaseNotified':1, 'biinieCollections':1,'loyalty':1,"likeObjects":1, "followObjects":1, "biinieCollect":1, "shareObjects":1},function(errBiinie,mobileUserData){
      if(errBiinie)
        throw errBiinie;
      organization.findOne({'sites.identifier':siteId},{'sites.identifier':1,'sites.showcases':1,'elements':1}).lean().exec(function(errorOrg,orgData){
        if(errorOrg)
          throw errorOrg;
        var site = _.find(orgData.sites,function(site){
          return site.identifier == siteId;
        });
        var showcase = _.find(site.showcases, function(showcase){
          return showcase.showcaseIdentifier == showcaseID;
        });
        if(showcase.elements.length < startElements){
          res.json({data:{"elements":elements},"status":"0","result":"1"});
        }else{
          var elementsIdArray = showcase.elements.splice(startElements,endElements);

          for (var i = 0; i < elementsIdArray.length; i++) {
            var elementToPush = _.find(orgData.elements,function(element){
              return elementsIdArray[i].identifier == element.elementIdentifier;
            });
            elementToPush._id = elementsIdArray[i]._id;
            elements.push(elementToPush);
          }

          for (var i = 0; i < elements.length; i++) {
            var isUserCollect = false;
            for(var j=0; j<mobileUserData.biinieCollections.length & !isUserCollect;j++){
              var elUserCollect =_.findWhere(mobileUserData.biinieCollections[j].elements,{identifier:elements[i].identifier});
              isUserCollect = elUserCollect != null;
            }

            var userShareElements = _.filter( mobileUserData.shareObjects, function(like){ return like.type === "element"});
            var elUserShared =_.findWhere(userShareElements,{identifier:elements[i].identifier})
            var isUserShared = elUserShared != null;

            var userLikeElements = _.filter( mobileUserData.likeObjects, function(like){ return like.type === "element"});
            var elUserLike =_.findWhere(userLikeElements,{identifier:elements[i].identifier})
            var isUserLike = elUserLike != null;

            var userFollowElements = _.filter( mobileUserData.followObjects, function(like){ return like.type === "element"});
            var elUserFollow =_.findWhere(userFollowElements,{identifier:elements[i].identifier})
            var isUserFollow = elUserFollow != null;

            var elUserViewed =_.findWhere(mobileUserData.seenElements,{elementIdentifier:elements[i].identifier})
            var isUserViewedElement = elUserViewed != null;

            elements[i].userShared=isUserShared?"1":"0";
            elements[i].userFollowed=isUserFollow?"1":"0";
            elements[i].userLiked=isUserLike?"1":"0";
            elements[i].userCollected=isUserCollect?"1":"0";
            elements[i].userViewed= isUserViewedElement?"1":"0";

            elements[i] = validateElementInitialInfo(elements[i]);
          }
          res.json({data:{"elements":elements},"status":"0","result":"1"});
        }

      });
    });
  }

  functions.getNextElementsInCategory = function(req,res){
    res.json([]);
  }
	return functions;
}
