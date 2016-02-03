module.exports = function () {
    var _ = require('underscore');
    var utils = require('../biin_modules/utils')();

    //Schemas
    var organization = require('../schemas/organization');
    var showcase = require('../schemas/showcase');
    var mobileUser = require('../schemas/mobileUser');
    var mobileSession = require('../schemas/mobileSession');
    var client = require('../schemas/client');
    var biin = require('../schemas/biin');
    var category = require('../schemas/category');

    // Config of priorities of categories
    var configPriorities = require('../config/priorities/priorities.json');

    // Default image
    var BIIN_DEFAULT_IMAGE = {
        domainColor: '170, 171, 171',
        mediaType: '1',
        title1: 'default',
        url: 'https://biinapp.blob.core.windows.net/biinmedia/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/media/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/4e8b2fb3-af89-461d-9c37-2cc667c20653/media/4af24d51-2173-4d41-b651-d82f18f00d1b.jpg',
        vibrantColor: '170, 171, 171',
        vibrantDarkColor: '85,86,86',
        vibrantLightColor: '170, 171, 171'
    };
    var functions = {};

    function validateSiteInitialInfo(site) {
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
        siteValidated.streetAddress1 = site.streetAddres ? site.streetAddres : "";
        siteValidated.streetAddress2 = site.ubication ? site.ubication : "";
        siteValidated.latitude = site.lat ? site.lat : "0";
        siteValidated.longitude = site.lng ? site.lng : "0";
        siteValidated.email = site.email ? site.email : "";
        siteValidated.nutshell = site.nutshell ? site.nutshell : "";
        siteValidated.phoneNumber = site.phoneNumber ? site.phoneNumber : "";
        siteValidated.media = site.media && site.media.length != 0 ? site.media : [BIIN_DEFAULT_IMAGE];
        siteValidated.neighbors = site.neighbors ? site.neighbors : [];
        siteValidated.showcases = site.showcases ? site.showcases : [];
        siteValidated.biins = site.biins ? site.biins : [];
        siteValidated.userShared = site.userShared ? site.userShared : "0";
        siteValidated.userFollowed = site.userShared ? site.userFollowed : "0";
        siteValidated.userLiked = site.userShared ? site.userLiked : "0";

        for (var i = 0; i < siteValidated.showcases.length; i++) {
            var showcase = {};
            if (siteValidated.showcases[i].showcaseIdentifier != null)
                showcase.identifier = siteValidated.showcases[i].showcaseIdentifier;
            else if (siteValidated.showcases[i].identifier != null)
                showcase.identifier = siteValidated.showcases[i].identifier;
            else
                showcase.identifier = "";

            showcase._id = siteValidated.showcases[i]._id ? siteValidated.showcases[i]._id : "";
            showcase.subTitle = siteValidated.showcases[i].subTitle ? siteValidated.showcases[i].subTitle : "";
            showcase.title = siteValidated.showcases[i].title ? siteValidated.showcases[i].title : "";
            showcase.elements = siteValidated.showcases[i].elements ? siteValidated.showcases[i].elements : [];
            showcase.elements_quantity = siteValidated.showcases[i].elements_quantity ? siteValidated.showcases[i].elements_quantity : "0";

            for (var j = 0; j < showcase.elements.length; j++) {
                var element = {};
                element._id = showcase.elements[j]._id ? showcase.elements[j]._id : "";
                element.identifier = showcase.elements[j].identifier ? showcase.elements[j].identifier : "";
                showcase.elements[j] = element;
            }
            siteValidated.showcases[i] = showcase;
        }

        for (i = 0; i < siteValidated.biins.length; i++) {
            var biin = {};
            biin._id = siteValidated.biins[i]._id ? siteValidated.biins[i]._id : "";
            biin.purchaseDate = siteValidated.biins[i].purchaseDate ? siteValidated.biins[i].purchaseDate : "";
            biin.accountIdentifier = siteValidated.biins[i].accountIdentifier ? siteValidated.biins[i].accountIdentifier : "";
            biin.siteIdentifier = siteValidated.biins[i].siteIdentifier ? siteValidated.biins[i].siteIdentifier : "";
            biin.organizationIdentifier = siteValidated.biins[i].organizationIdentifier ? siteValidated.biins[i].organizationIdentifier : "";
            biin.isAssigned = siteValidated.biins[i].isAssigned ? "1" : "0";
            biin.status = siteValidated.biins[i].status ? siteValidated.biins[i].status : "";
            biin.longitude = siteValidated.biins[i].longitude ? siteValidated.biins[i].longitude + "" : "0";
            biin.latitude = siteValidated.biins[i].latitude ? siteValidated.biins[i].latitude + "" : "0";
            biin.isRequiredBiin = siteValidated.biins[i].isRequiredBiin ? "1" : "0";
            biin.biinType = siteValidated.biins[i].biinType ? siteValidated.biins[i].biinType : "";
            biin.showcases = siteValidated.biins[i].showcases ? siteValidated.biins[i].showcases : [];
            biin.children = siteValidated.biins[i].children ? siteValidated.biins[i].children : [];
            biin.lastUpdate = siteValidated.biins[i].lastUpdate ? siteValidated.biins[i].lastUpdate : "";
            biin.registerDate = siteValidated.biins[i].registerDate ? siteValidated.biins[i].registerDate : "";
            biin.position = siteValidated.biins[i].position ? siteValidated.biins[i].position : "";
            biin.venue = siteValidated.biins[i].venue ? siteValidated.biins[i].venue : "";
            biin.proximityUUID = siteValidated.biins[i].proximityUUID ? siteValidated.biins[i].proximityUUID : "";
            biin.minor = siteValidated.biins[i].minor ? siteValidated.biins[i].minor : "";
            biin.major = siteValidated.biins[i].major ? siteValidated.biins[i].major : "";
            biin.name = siteValidated.biins[i].name ? siteValidated.biins[i].name : "";
            biin.brandIdentifier = siteValidated.biins[i].brandIdentifier ? siteValidated.biins[i].brandIdentifier : "";
            biin.identifier = siteValidated.biins[i].identifier ? siteValidated.biins[i].identifier : "";
            var objects = [];
            for (j = 0; j < siteValidated.biins[i].objects.length; j++) {
                var object = {};
                var objectToValidate = siteValidated.biins[i].objects[j];
                object._id = objectToValidate._id ? objectToValidate._id : "";
                object.onSaturday = objectToValidate.onSaturday ? objectToValidate.onSaturday : "0";
                object.onFriday = objectToValidate.onFriday ? objectToValidate.onFriday : "0";
                object.onThursday = objectToValidate.onThursday ? objectToValidate.onThursday : "0";
                object.onWednesday = objectToValidate.onWednesday ? objectToValidate.onWednesday : "0";
                object.onTuesday = objectToValidate.onTuesday ? objectToValidate.onTuesday : "0";
                object.onMonday = objectToValidate.onMonday ? objectToValidate.onMonday : "0";
                object.onSunday = objectToValidate.onSunday ? objectToValidate.onSunday : "0";
                object.endTime = objectToValidate.endTime ? objectToValidate.endTime : "24";
                object.startTime = objectToValidate.startTime ? objectToValidate.startTime : "0";
                object.hasTimeOptions = objectToValidate.hasTimeOptions ? objectToValidate.hasTimeOptions : "0";
                object.hasNotification = objectToValidate.hasNotification ? objectToValidate.hasNotification : "0";
                object.notification = objectToValidate.notification ? objectToValidate.notification : "";
                object.name = objectToValidate.name ? objectToValidate.name : "";
                object.objectType = objectToValidate.objectType ? objectToValidate.objectType : "1";
                object.identifier = objectToValidate.identifier ? objectToValidate.identifier : "";
                object.isDefault = objectToValidate.isDefault ? objectToValidate.isDefault : "0";
                object.isUserNotified = objectToValidate.isUserNotified ? objectToValidate.isUserNotified : "0";
                object.isCollected = objectToValidate.isCollected ? objectToValidate.isCollected : "0";
                objects.push(object);
            }
            biin.objects = objects;
            siteValidated.biins[i] = biin;
        }

        return siteValidated;
    }

    function validateOrganizationInitialInfo(organization) {

        var organizationValidated = {};
        organizationValidated.identifier = organization.identifier ? organization.identifier : "";
        organizationValidated._id = organization._id ? organization._id : "";
        organizationValidated.media = organization.media && organization.media.length != 0 ? organization.media : [BIIN_DEFAULT_IMAGE];
        organizationValidated.extraInfo = organization.extraInfo ? organization.extraInfo : "";
        organizationValidated.description = organization.description ? organization.description : "";
        organizationValidated.brand = organization.brand ? organization.brand : "";
        organizationValidated.name = organization.name ? organization.name : "";
        organizationValidated.isLoyaltyEnabled = organization.isLoyaltyEnabled ? organization.isLoyaltyEnabled : "0";
        organizationValidated.loyalty = organization.loyalty ? organization.loyalty : [];
        if (!Array.isArray(organizationValidated.media)) {
            organizationValidated.media = [organizationValidated.media];
        }
        for (var i = 0; i < organizationValidated.media.length; i++) {
            var newOrganization = {};
            newOrganization.vibrantLightColor = organizationValidated.media[i].vibrantLightColor;
            newOrganization.vibrantDarkColor = organizationValidated.media[i].vibrantDarkColor;
            newOrganization.vibrantColor = organizationValidated.media[i].vibrantColor;
            newOrganization.url = organizationValidated.media[i].url;
            organizationValidated.media[i] = newOrganization;
        }

        return organizationValidated;
    }

    function validateElementInitialInfo(element) {
        var elementValidated = {};
        elementValidated._id = element._id ? element._id : "";
        elementValidated.identifier = element.elementIdentifier ? element.elementIdentifier : "";
        elementValidated.sharedCount = element.sharedCount ? element.sharedCount : "0";
        elementValidated.categories = element.categories ? element.categories : [];
        elementValidated.quantity = element.quantity ? element.quantity : "";
        elementValidated.hasQuantity = element.hasQuantity ? "1" : "0";

        elementValidated.expirationDate = element.expirationDate ? element.expirationDate : "";
        elementValidated.expirationDate = elementValidated.expirationDate == "" ? utils.getDateNow() : utils.getDate(elementValidated.expirationDate);

        elementValidated.initialDate = element.initialDate ? element.initialDate : "";
        elementValidated.initialDate = elementValidated.initialDate == "" ? utils.getDateNow() : utils.getDate(elementValidated.initialDate);

        elementValidated.hasTimming = element.hasTimming ? element.hasTimming : "0";
        elementValidated.savings = element.savings ? element.savings : "";
        elementValidated.hasSaving = element.hasSaving ? element.hasSaving : "0";
        elementValidated.discount = element.discount ? element.discount : "";
        elementValidated.hasDiscount = element.hasDiscount ? element.hasDiscount : "0";
        elementValidated.isHighlight = element.isHighlight ? element.isHighlight : "0";

        //In the database is returned like a number
        elementValidated.price = element.price ? element.price + "" : "0";

        elementValidated.hasPrice = element.hasPrice ? element.hasPrice : "0";
        elementValidated.listPrice = element.listPrice ? element.listPrice : "";
        elementValidated.hasListPrice = element.hasListPrice ? element.hasListPrice : "0";
        elementValidated.hasFromPrice = element.hasFromPrice ? element.hasFromPrice : "0";
        elementValidated.currencyType = element.currencyType ? element.currencyType : "1";
        elementValidated.searchTags = element.searchTags ? element.searchTags : [];
        elementValidated.subTitle = element.subTitle ? element.subTitle : "";
        elementValidated.title = element.title ? element.title : "";

        //In the database is returned like a number
        elementValidated.collectCount = element.collectCount ? element.collectCount + "" : "0";

        elementValidated.detailsHtml = element.detailsHtml ? element.detailsHtml : "";
        elementValidated.reservedQuantity = element.reservedQuantity ? element.reservedQuantity : "0";
        elementValidated.claimedQuantity = element.claimedQuantity ? element.claimedQuantity : "0";
        elementValidated.actualQuantity = element.actualQuantity ? element.actualQuantity : "0";
        elementValidated.media = element.media && element.media.length != 0 ? element.media : [BIIN_DEFAULT_IMAGE];

        //this fields need to be get from userHistory
        elementValidated.userShared = element.userShared ? element.userShared : "0";
        elementValidated.userLiked = element.userLiked ? element.userLiked : "0";
        elementValidated.userCollected = element.userCollected ? element.userCollected : "0";
        elementValidated.userViewed = element.userViewed ? element.userViewed : "0";
        if(!element.hasCallToAction){
          elementValidated.hasCallToAction  = "0";
        }else{
          elementValidated.hasCallToAction  = "1";
        }
        elementValidated.callToActionURL = element.callToActionURL?element.callToActionURL:"";
        elementValidated.callToActionTitle = element.callToActionTitle? element.callToActionTitle : "";


        return elementValidated;
    }


    functions.getInitialData = function (req, res) {
        var userIdentifier = req.param("biinieId");
        var userLat = eval(req.param("latitude"));
        var userLng = eval(req.param("longitude"));
        var MAX_SITES = process.env.SITES_INITIAL_DATA || 10;
        var ELEMENTS_IN_CATEGORY = process.env.ELEMENTS_IN_CATEGORY || 7;
        var LIMIT_HIGHLIGHTS_TO_SENT = process.env.LIMIT_HIGHLIGHTS_TO_SENT || 6;
        var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
        var DEFAULT_COLLECTION = 0;
        var response = {};
        var organizations = [];
        var elements = [];
        var highlights = [];
        var categories = [];
        var sites = [];

        mobileUser.findOne({'identifier': userIdentifier}, {
            'gender': 1,
            'showcaseNotified': 1,
            'biinieCollections': 1,
            'loyalty': 1,
            "likeObjects": 1,
            "followObjects": 1,
            "biinieCollect": 1,
            "shareObjects": 1
        }, function (errBiinie, mobileUserData) {
            if (errBiinie)
                throw errBiinie;

            biin.find({status: "Installed"}, {}).lean().exec(function (errBiin, biins) {
                if (errBiin)
                    throw errBiin;

                organization.find({},
                    {
                        'identifier': 1,
                        'sites.identifier': 1,
                        'sites.organizationIdentifier': 1,
                        'sites.proximityUUID': 1,
                        'sites.major': 1,
                        'sites.country': 1,
                        'sites.state': 1,
                        'sites.city': 1,
                        'sites.zipCode': 1,
                        'sites.ubication': 1,
                        'sites.title1': 1,
                        'sites.title2': 1,
                        'sites.streetAddress1': 1,
                        'sites.lat': 1,
                        'sites.lng': 1,
                        'sites.email': 1,
                        'sites.nutshell': 1,
                        'sites.phoneNumber': 1,
                        'sites.media.mediaType': 1,
                        'sites.media.url': 1,
                        'sites.media.vibrantColor': 1,
                        'sites.media.vibrantDarkColor': 1,
                        'sites.media.vibrantLightColor': 1,
                        'sites.neighbors': 1,
                        'sites.showcases': 1,
                        'sites.biins': 1,
                        'sites.categories': 1,
                        'sites.isReady': 1
                    }).lean().exec(function (error, data) {

                        var sitesDesnormalized = [];

                        for (var i = 0; i < data.length; i++) {
                            for (var j = 0; j < data[i].sites.length; j++) {
                                sitesDesnormalized.push({organizationId: data[i].identifier, site: data[i].sites[j]});
                            }
                        }

                        sitesDesnormalized = _.filter(sitesDesnormalized, function (site) {
                            return site.site.isReady == 1;
                        });

                        for (var i = 0; i < biins.length; i++) {
                            for (var j = 0; j < biins[i].objects.length; j++) {
                                var el = null;
                                if (mobileUser.biinieCollections && mobileUser.biinieCollections[DEFAULT_COLLECTION] && mobileUser.biinieCollections[DEFAULT_COLLECTION].elements)
                                    el = _.findWhere(mobileUser.biinieCollections[DEFAULT_COLLECTION].elements, {identifier: biins[i].objects[j].identifier});
                                biins[i].objects[j].isUserNotified = '0';
                                biins[i].objects[j].isCollected = el ? '1' : '0';
                            }
                        }

                        for (i = 0; i < sitesDesnormalized.length; i++) {
                            sitesDesnormalized[i].site.organizationIdentifier = sitesDesnormalized[i].organizationId;
                            sitesDesnormalized[i].site.proximity = utils.getProximity(userLat, userLng, sitesDesnormalized[i].site.lat, sitesDesnormalized[i].site.lng);
                            var biinsSite = _.filter(biins, function (biin) {
                                return biin.siteIdentifier == sitesDesnormalized[i].site.identifier;
                            });
                            sitesDesnormalized[i].site.biins = biinsSite;
                        }

                        sitesDesnormalized = _.filter(sitesDesnormalized, function (site) {
                            return site.site.biins.length > 0;
                        });

                        var sortByProximity = _.sortBy(sitesDesnormalized, function (site) {
                            return site.site.proximity;
                        });

                        var sitesReducedAndSorted = sortByProximity.splice(0, MAX_SITES);
                        for (i = 0; i < sitesReducedAndSorted.length; i++) {
                            sites.push(sitesReducedAndSorted[i].site);
                        }
                        for (i = 0; i < sites.length; i++) {

                            var userShare = _.findWhere(mobileUserData.shareObjects, {
                                identifier: sites[i].identifier,
                                type: "site"
                            });
                            var userCollected = _.findWhere(mobileUserData.biinieCollections.sites, {identifier: sites[i].identifier});
                            var userFollowed = _.findWhere(mobileUserData.followObjects, {
                                identifier: sites[i].identifier,
                                type: "site"
                            });
                            var userLiked = _.findWhere(mobileUserData.likeObjects, {
                                identifier: sites[i].identifier,
                                type: "site"
                            });

                            sites[i].userShared = typeof(userShare) !== "undefined" ? "1" : "0";
                            sites[i].userFollowed = typeof(userFollowed) !== "undefined" ? "1" : "0";
                            sites[i].userCollected = typeof(userCollected) !== "undefined" ? "1" : "0";
                            sites[i].userLiked = typeof(userLiked) !== "undefined" ? "1" : "0";
                        }
                        var elementsInBiinsObjects = [];
                        for (var i = 0; i < sites.length; i++) {
                            for (var j = 0; j < sites[i].biins.length; j++) {
                                for (var k = 0; k < sites[i].biins[j].objects.length; k++) {
                                    if (sites[i].biins[j].objects[k].name == "element") {
                                        elementsInBiinsObjects.push(sites[i].biins[j].objects[k].identifier);
                                    }
                                }
                            }
                        }

                        elementsInBiinsObjects = _.uniq(elementsInBiinsObjects);


                        response.sites = sites;

                        var showcasesToFind = [];

                        for (i = 0; i < response.sites.length; i++) {
                            for (j = 0; j < response.sites[i].showcases.length; j++) {
                                showcasesToFind.push(response.sites[i].showcases[j].showcaseIdentifier);
                            }
                        }

                        showcasesToFind = _.uniq(showcasesToFind);
                        showcase.find({identifier: {$in: showcasesToFind}},
                            {
                                "name": 1,
                                "description": 1,
                                "identifier": 1,
                                "isReady": 1
                            }).lean().exec(
                            function (showcasesError, showcasesData) {
                                if (showcasesError)
                                    throw showcasesError;

                                for (var i = 0; i < sites.length; i++) {
                                    for (var j = 0; j < sites[i].showcases.length; j++) {
                                        sites[i].showcases[j].identifier = sites[i].showcases[j].showcaseIdentifier;
                                        delete sites[i].showcases[j].showcaseIdentifier;

                                        var showcaseData = _.find(showcasesData, function (showcase) {
                                            return showcase.identifier == sites[i].showcases[j].identifier;
                                        });
                                        sites[i].showcases[j].title = showcaseData.name;
                                        sites[i].showcases[j].subTitle = showcaseData.description;
                                        sites[i].showcases[j].isReady = showcaseData.isReady;
                                    }
                                    sites[i].showcases = _.filter(sites[i].showcases, function (showcase) {
                                        return showcase.isReady == 1;
                                    });
                                }

                                var organizationsToFind = [];
                                for (i = 0; i < sitesReducedAndSorted.length; i++) {
                                    organizationsToFind.push(sitesReducedAndSorted[i].organizationId)
                                }

                                organizationsToFind = _.uniq(organizationsToFind);
                                organization.find({identifier: {$in: organizationsToFind}},
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
                                    }).lean().exec(function (error, orgData) {
                                        if (error)
                                            throw error;

                                        for (i = 0; i < orgData.length; i++) {
                                            elements = elements.concat(orgData[i].elements);
                                            delete orgData[i].elements;
                                            organizations.push(orgData[i]);
                                        }

                                        var elementsInShowcase = [];

                                        for (i = 0; i < response.sites.length; i++) {
                                            for (j = 0; j < response.sites[i].showcases.length; j++) {
                                                for (var k = 0; k < response.sites[i].showcases[j].elements.length; k++) {
                                                    elementData = _.findWhere(elements, {elementIdentifier: response.sites[i].showcases[j].elements[k].identifier});
                                                    response.sites[i].showcases[j].elements[k].isReady = elementData.isReady;
                                                }

                                                response.sites[i].showcases[j].elements = _.filter(response.sites[i].showcases[j].elements, function (element) {
                                                    return element.isReady == 1;
                                                })
                                                if (response.sites[i].showcases[j].elements.length == 0) {
                                                    response.sites[i].showcases.splice(j, 1);
                                                    j--;
                                                } else {
                                                    response.sites[i].showcases[j].elements_quantity = response.sites[i].showcases[j].elements.length + "";
                                                    response.sites[i].showcases[j].elements = response.sites[i].showcases[j].elements.splice(0, LIMIT_ELEMENTS_IN_SHOWCASE);
                                                    elementsInShowcase = elementsInShowcase.concat(response.sites[i].showcases[j].elements);
                                                }
                                            }
                                        }

                                        var uniqueElementsShowcase = _.pluck(elementsInShowcase, 'identifier');
                                        uniqueElementsShowcase = _.uniq(uniqueElementsShowcase);

                                        uniqueElementsShowcase = uniqueElementsShowcase.concat(elementsInBiinsObjects);
                                        uniqueElementsShowcase = _.uniq(uniqueElementsShowcase);

                                        var elementsfiltered = _.filter(elements, function (element) {
                                            return uniqueElementsShowcase.indexOf(element.elementIdentifier) > -1;
                                        });

                                        var elementWithCategories = [];
                                        for (i = 0; i < elementsInShowcase.length; i++) {

                                            var element = elementsInShowcase[i];
                                            elementData = _.findWhere(elementsfiltered, {elementIdentifier: element.identifier});
                                            if (elementData) {
                                                element.categories = elementData.categories;
                                                element.isHighlight = elementData.isHighlight;
                                                elementWithCategories.push(element);
                                            }
                                        }

                                        //Fill highlights array
                                        for (i = 0; i < elementsfiltered.length; i++) {
                                            if (elementsfiltered[i].isHighlight == "1") {
                                                highlights.push(elementsfiltered[i].elementIdentifier);
                                            }
                                        }

                                        var hightlightsFiltered = _.filter(elementsInShowcase, function (element) {
                                            return highlights.indexOf(element.identifier) > -1;
                                        });

                                        hightlightsFiltered = hightlightsFiltered.splice(0, LIMIT_HIGHLIGHTS_TO_SENT);

                                        //Fill categories array

                                        //Obtain the categories
                                        var elementsCategories = [];
                                        for (i = 0; i < elementsfiltered.length; i++) {
                                            elementsCategories = elementsCategories.concat(elementsfiltered[i].categories);
                                        }
                                        //Obtain the unique categories from elements that are going to sent
                                        var uniqueCategories = [];
                                        for (i = 0; i < elementsCategories.length; i++) {
                                            uniqueCategories.push(elementsCategories[i].identifier);
                                        }
                                        uniqueCategories = _.uniq(uniqueCategories);

                                        //reorder categories
                                        var prioritiesList = mobileUserData.gender == 'male' ? configPriorities.priorities.men : configPriorities.priorities.women;
                                        uniqueCategories = _.sortBy(uniqueCategories, function (category) {
                                            var priorityObject = _.find(prioritiesList, {identifier: category});
                                            return priorityObject.priority;
                                        });
                                        uniqueCategories = uniqueCategories.reverse();


                                        var elementsSentInCategories = [];

                                        for (i = 0; i < uniqueCategories.length; i++) {

                                            var elementsWithCategories = _.filter(elementWithCategories, function (element) {
                                                return _.find(element.categories, function (category) {
                                                        return uniqueCategories[i] == category.identifier;
                                                    }) != null;
                                            });
                                            elementsWithCategories = _.sortBy(elementsWithCategories, function (element) {
                                                return element.isHighlight == "1" ? 0 : 1;
                                            });

                                            var elementsIdAdded = [];
                                            elementsWithCategories = _.filter(elementsWithCategories, function (element) {
                                                var isAddedInElements = _.contains(elementsIdAdded, element.identifier);
                                                if (!isAddedInElements)
                                                    elementsIdAdded.push(element.identifier);
                                                return !isAddedInElements;
                                            });


                                            elementsWithCategories = elementsWithCategories.splice(0, ELEMENTS_IN_CATEGORY);
                                            elementsSentInCategories = elementsSentInCategories.concat(elementsWithCategories);

                                            categories.push({
                                                identifier: uniqueCategories[i],
                                                elements: elementsWithCategories
                                            });
                                        }

                                        for (i = 0; i < elementsfiltered.length; i++) {

                                            var isUserCollect = false;
                                            for (j = 0; j < mobileUserData.biinieCollections.length && !isUserCollect; j++) {
                                                var elUserCollect = _.findWhere(mobileUserData.biinieCollections[j].elements, {identifier: elementsfiltered[i].elementIdentifier});
                                                isUserCollect = elUserCollect != null;
                                            }

                                            var userShareElements = _.filter(mobileUserData.shareObjects, function (like) {
                                                return like.type === "element"
                                            });
                                            var elUserShared = _.findWhere(userShareElements, {identifier: elementsfiltered[i].elementIdentifier});
                                            var isUserShared = elUserShared != null;

                                            var userLikeElements = _.filter(mobileUserData.likeObjects, function (like) {
                                                return like.type === "element"
                                            });
                                            var elUserLike = _.findWhere(userLikeElements, {identifier: elementsfiltered[i].elementIdentifier});
                                            var isUserLike = elUserLike != null;

                                            var userFollowElements = _.filter(mobileUserData.followObjects, function (like) {
                                                return like.type === "element"
                                            });
                                            var elUserFollow = _.findWhere(userFollowElements, {identifier: elementsfiltered[i].elementIdentifier});
                                            var isUserFollow = elUserFollow != null;

                                            var elUserViewed = _.findWhere(mobileUserData.seenElements, {elementIdentifier: elementsfiltered[i].elementIdentifier});
                                            var isUserViewedElement = elUserViewed != null;

                                            elementsfiltered[i].userShared = isUserShared ? "1" : "0";
                                            elementsfiltered[i].userFollowed = isUserFollow ? "1" : "0";
                                            elementsfiltered[i].userLiked = isUserLike ? "1" : "0";
                                            elementsfiltered[i].userCollected = isUserCollect ? "1" : "0";
                                            elementsfiltered[i].userViewed = isUserViewedElement ? "1" : "0";
                                        }

                                        var sitesSent = [];
                                        var organizationsSent = [];
                                        var elementsSent = [];
                                        for (i = 0; i < response.sites.length; i++) {
                                            response.sites[i] = validateSiteInitialInfo(response.sites[i]);
                                            sitesSent.push({identifier: response.sites[i].identifier});
                                        }
                                        for (i = 0; i < organizations.length; i++) {
                                            organizations[i] = validateOrganizationInitialInfo(organizations[i]);
                                            organizationsSent.push({identifier: organizations[i].identifier});
                                        }
                                        for (i = 0; i < elementsfiltered.length; i++) {
                                            elementsfiltered[i] = validateElementInitialInfo(elementsfiltered[i]);
                                            elementsSent.push({identifier: elementsfiltered[i].identifier});
                                        }

                                        response.organizations = organizations;
                                        response.elements = elementsfiltered;
                                        response.highlights = hightlightsFiltered;
                                        response.categories = categories;
                                        res.json({data: response, status: "0", result: "1"});

                                        var elementsByCategoriesSent = [];
                                        for (var i = 0; i < categories.length; i++) {
                                            var elementsInTheCategorySent = [];
                                            for (var j = 0; j < categories[i].elements.length; j++) {
                                                elementsInTheCategorySent.push(categories[i].elements[j].identifier);
                                            }
                                            elementsByCategoriesSent.push({
                                                identifier: categories[i].identifier,
                                                elementsSent: elementsInTheCategorySent
                                            });
                                        }
                                        mobileSession.findOneAndUpdate(
                                            {identifier: userIdentifier},
                                            {
                                                $set: {
                                                    lastLocation: [userLng, userLat],
                                                    sitesSent: response.sites,
                                                    elementsSent: elementsfiltered,
                                                    elementsSentByCategory: elementsByCategoriesSent,
                                                    organizatonsSent: organizations,
                                                    elementsAvailable: []
                                                }
                                            },
                                            {upsert: true}, // insert the document if it does not exist
                                            function (error) {
                                                if (error)
                                                    throw error;
                                            });
                                    });
                            });
                    });
            });
        });
    };

    functions.getNextElementInShowcase = function (req, res) {
        //res.json(elementsJson);
        var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
        var userIdentifier = req.param("identifier");
        var siteId = req.param('siteIdentifier');
        var showcaseID = req.param('showcaseIdentifier');
        var batchNumber = req.param('batch');
        var startElements = (batchNumber - 1) * LIMIT_ELEMENTS_IN_SHOWCASE;
        var endElements = LIMIT_ELEMENTS_IN_SHOWCASE;
        var elements = [];
        mobileUser.findOne({'identifier': userIdentifier}, {
            'showcaseNotified': 1,
            'biinieCollections': 1,
            'loyalty': 1,
            "likeObjects": 1,
            "followObjects": 1,
            "biinieCollect": 1,
            "shareObjects": 1
        }, function (errBiinie, mobileUserData) {
            if (errBiinie)
                throw errBiinie;
            organization.findOne({'sites.identifier': siteId}, {
                'sites.identifier': 1,
                'sites.showcases': 1,
                'elements': 1
            }).lean().exec(function (errorOrg, orgData) {
                if (errorOrg)
                    throw errorOrg;
                var site = _.find(orgData.sites, function (site) {
                    return site.identifier == siteId;
                });
                var showcase = _.find(site.showcases, function (showcase) {
                    return showcase.showcaseIdentifier == showcaseID;
                });

                for (var i = 0; i < showcase.elements.length; i++) {
                    var elementData = _.findWhere(orgData.elements, {elementIdentifier: showcase.elements[i].identifier});
                    showcase.elements[i].isReady = elementData.isReady;
                }
                showcase.elements = _.filter(showcase.elements, function (element) {
                    return element.isReady == 1;
                })

                var elementsIdArray = showcase.elements.splice(startElements, endElements);

                for (i = 0; i < elementsIdArray.length; i++) {
                    var elementToPush = _.find(orgData.elements, function (element) {
                        return elementsIdArray[i].identifier == element.elementIdentifier;
                    });
                    elementToPush._id = elementsIdArray[i]._id;
                    elements.push(elementToPush);
                }

                for (var i = 0; i < elements.length; i++) {
                    var isUserCollect = false;
                    for (var j = 0; j < mobileUserData.biinieCollections.length && !isUserCollect; j++) {
                        var elUserCollect = _.findWhere(mobileUserData.biinieCollections[j].elements, {identifier: elements[i].elementIdentifier});
                        isUserCollect = elUserCollect != null;
                    }

                    var userShareElements = _.filter(mobileUserData.shareObjects, function (like) {
                        return like.type === "element"
                    });
                    var elUserShared = _.findWhere(userShareElements, {identifier: elements[i].elementIdentifier});
                    var isUserShared = elUserShared != null;

                    var userLikeElements = _.filter(mobileUserData.likeObjects, function (like) {
                        return like.type === "element"
                    });
                    var elUserLike = _.findWhere(userLikeElements, {identifier: elements[i].elementIdentifier});
                    var isUserLike = elUserLike != null;

                    var userFollowElements = _.filter(mobileUserData.followObjects, function (like) {
                        return like.type === "element"
                    });
                    var elUserFollow = _.findWhere(userFollowElements, {identifier: elements[i].elementIdentifier});
                    var isUserFollow = elUserFollow != null;

                    var elUserViewed = _.findWhere(mobileUserData.seenElements, {elementIdentifier: elements[i].elementIdentifier});
                    var isUserViewedElement = elUserViewed != null;

                    elements[i].userShared = isUserShared ? "1" : "0";
                    elements[i].userFollowed = isUserFollow ? "1" : "0";
                    elements[i].userLiked = isUserLike ? "1" : "0";
                    elements[i].userCollected = isUserCollect ? "1" : "0";
                    elements[i].userViewed = isUserViewedElement ? "1" : "0";

                    elements[i] = validateElementInitialInfo(elements[i]);
                }
                res.json({data: {"elements": elements}, "status": "0", "result": "1"});
            });
        });
    };

    functions.getNextElementsInCategory = function (req, res) {
        var userIdentifier = req.params["identifier"];
        var categoryId = req.params["idCategory"];
        var ELEMENTS_IN_CATEGORY = process.env.ELEMENTS_IN_CATEGORY || 7;
        var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
        var response = {};
        response.sites = [];
        response.organizations = [];
        response.elements = [];
        mobileUser.findOne({"identifier": userIdentifier}, {
            _id: 0, 'gender': 1,
            'showcaseNotified': 1,
            'biinieCollections': 1,
            'loyalty': 1,
            "likeObjects": 1,
            "followObjects": 1,
            "biinieCollect": 1,
            "shareObjects": 1
        }, function (err, data) {
            if (err)
                throw err;

            biin.find({status: "Installed"}, {}).lean().exec(function (errBiin, biins) {
                if (errBiin)
                    throw errBiin;

                mobileSession.findOne({identifier: userIdentifier}, {}).lean().exec(function (errMobileSession, mobileUserData) {
                    if (errMobileSession)
                        throw errMobileSession;

                    if (mobileUserData) {
                        //Get sites sent to the user
                        var sitesInUserCellphone = _.pluck(mobileUserData.sitesSent, 'identifier');
                        biin.find({status: "Installed"}, {}).lean().exec(function (errBiin, biins) {
                            if (errBiin)
                                throw errBiin;

                            // get site information
                            organization.find({'sites.identifier': {$in: sitesInUserCellphone}}, {
                                "sites.userComments": 0,
                                "sites.userLiked": 0,
                                "sites.userCollected": 0,
                                "sites.userFollowed": 0,
                                "sites.userShared": 0,
                                "sites.biinedUsers": 0
                            }).lean().exec(function (errSites, sitesData) {
                                if (errSites)
                                    throw errSites;
                                //Desnormalize sites into an array of sites
                                // TODO: IMPROVE THIS WITH MOVING SITES INFORMATION TO SITE COLLECTION
                                var sitesDesnormalized = [];
                                for (var i = 0; i < sitesData.length; i++) {
                                    for (var j = 0; j < sitesData[i].sites.length; j++) {
                                        sitesData[i].sites[j].organizationIdentifier = sitesData[i].identifier;
                                        sitesDesnormalized.push(sitesData[i].sites[j]);
                                    }
                                }
                                //filter sites to just the only the user had in his cellphone
                                sitesDesnormalized = _.filter(sitesDesnormalized, function (site) {
                                    return _.contains(sitesInUserCellphone, site.identifier);
                                });

                                //Desnormalize elements into an array of elements
                                var elementsDesnormalized = [];
                                for (i = 0; i < sitesData.length; i++) {
                                    for (j = 0; j < sitesData[i].elements.length; j++) {
                                        elementsDesnormalized.push(sitesData[i].elements[j]);
                                    }
                                }

                                //Obtain showcase information (specially the isReady attribute)

                                var showcasesToFind = [];
                                for (i = 0; i < sitesDesnormalized.length; i++) {
                                    for (j = 0; j < sitesDesnormalized[i].showcases.length; j++) {
                                        showcasesToFind.push(sitesDesnormalized[i].showcases[j].showcaseIdentifier);
                                    }
                                }

                                showcasesToFind = _.uniq(showcasesToFind);
                                showcase.find({identifier: {$in: showcasesToFind}},
                                    {
                                        "name": 1,
                                        "description": 1,
                                        "identifier": 1,
                                        "isReady": 1
                                    }).lean().exec(function (showcaseError, showcaseDataFromSitesSent) {

                                        //getting only the elements without copy
                                        elementsDesnormalized = _.uniq(elementsDesnormalized);

                                        for (var i = 0; i < sitesDesnormalized.length; i++) {
                                            for (var j = 0; j < sitesDesnormalized[i].showcases.length; j++) {
                                                sitesDesnormalized[i].showcases[j].identifier = sitesDesnormalized[i].showcases[j].showcaseIdentifier;
                                                delete sitesDesnormalized[i].showcases[j].showcaseIdentifier;

                                                var showcaseData = _.find(showcaseDataFromSitesSent, function (showcase) {
                                                    return showcase.identifier == sitesDesnormalized[i].showcases[j].identifier;
                                                });
                                                sitesDesnormalized[i].showcases[j].title = showcaseData.name;
                                                sitesDesnormalized[i].showcases[j].subTitle = showcaseData.description;
                                                sitesDesnormalized[i].showcases[j].isReady = showcaseData.isReady;
                                            }
                                            sitesDesnormalized[i].showcases = _.filter(sitesDesnormalized[i].showcases, function (showcase) {
                                                return showcase.isReady == 1;
                                            });
                                        }


                                        var elementsInShowcase = [];

                                        for (i = 0; i < sitesDesnormalized.length; i++) {
                                            for (j = 0; j < sitesDesnormalized[i].showcases.length; j++) {
                                                for (var k = 0; k < sitesDesnormalized[i].showcases[j].elements.length; k++) {
                                                    elementData = _.findWhere(elementsDesnormalized, {elementIdentifier: sitesDesnormalized[i].showcases[j].elements[k].identifier});
                                                    sitesDesnormalized[i].showcases[j].elements[k].isReady = elementData.isReady;
                                                }

                                                sitesDesnormalized[i].showcases[j].elements = _.filter(sitesDesnormalized[i].showcases[j].elements, function (element) {
                                                    return element.isReady == 1;
                                                });

                                                var elementsToConcat = sitesDesnormalized[i].showcases[j].elements;
                                                _.each(elementsToConcat, function (element) {
                                                    element.showcase_id = sitesDesnormalized[i].showcases[j]._id;
                                                });

                                                if (sitesDesnormalized[i].showcases[j].elements.length == 0) {
                                                    sitesDesnormalized[i].showcases.splice(j, 1);
                                                    j--;
                                                } else {
                                                    sitesDesnormalized[i].showcases[j].elements_quantity = sitesDesnormalized[i].showcases[j].elements.length + "";
                                                    sitesDesnormalized[i].showcases[j].elements = sitesDesnormalized[i].showcases[j].elements.splice(0, LIMIT_ELEMENTS_IN_SHOWCASE);
                                                    elementsInShowcase = elementsInShowcase.concat(sitesDesnormalized[i].showcases[j].elements);
                                                }
                                            }
                                        }

                                        // Obtain an array with the element's identifier and convert it into a unique list
                                        var elementsIdentifierFromShowcase = _.pluck(elementsInShowcase, 'identifier');
                                        var uniqueElementsIdentifierFromShowcase = _.uniq(elementsIdentifierFromShowcase);

                                        //Remove elements that are not ready

                                        // Get elements sent to the user
                                        var elementsInCategorySent = _.findWhere(mobileUserData.elementsSentByCategory, {'identifier': categoryId});

                                        // Obtain which elements are available for sending to the user
                                        var availableElementsToSent = [];
                                        if (elementsInCategorySent) {
                                            availableElementsToSent = _.difference(uniqueElementsIdentifierFromShowcase, elementsInCategorySent.elementsSent);
                                        } else {
                                            availableElementsToSent = _.difference(uniqueElementsIdentifierFromShowcase, []);
                                        }
                                        //Get which elements are in the category.
                                        var elementsWithinCategory = [];
                                        for (i = 0; i < availableElementsToSent.length; i++) {
                                            var elementData = _.findWhere(elementsDesnormalized, {'elementIdentifier': availableElementsToSent[i], 'isReady':1});
                                            if (elementData) {
                                                for (j = 0; j < elementData.categories.length; j++) {
                                                    if (elementData.categories[j].identifier == categoryId) {
                                                        elementsWithinCategory.push(elementData);
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                        //if the elements are too few to send the next batch, will try to fill
                                        //it with new info from sites that aren't from  site sent to the user
                                        if (elementsWithinCategory.length < ELEMENTS_IN_CATEGORY) {

                                            // Obtaing _id for the nearest Showcase and adding into the group id
                                            var elementsForCategory = [];
                                            for (i = 0; i < elementsWithinCategory.length; i++) {
                                                for (j = 0; j < elementsInShowcase.length; j++) {
                                                    if (elementsWithinCategory[i].elementIdentifier == elementsInShowcase[j].identifier) {
                                                        elementsForCategory.push({
                                                            showcase_id: elementsInShowcase[j].showcase_id,
                                                            _id: elementsInShowcase[j]._id,
                                                            identifier: elementsWithinCategory[i].elementIdentifier
                                                        });
                                                        response.elements.push(elementsWithinCategory[i]);
                                                        break;
                                                    }
                                                }
                                            }

                                            var amountOfExtraElementsNeeded = ELEMENTS_IN_CATEGORY - elementsWithinCategory.length;

                                            //Get extra site informmation
                                            organization.find({'sites.identifier': {$nin: sitesInUserCellphone}}, {
                                                "sites.userComments": 0,
                                                "sites.userLiked": 0,
                                                "sites.userCollected": 0,
                                                "sites.userFollowed": 0,
                                                "sites.userShared": 0,
                                                "sites.biinedUsers": 0
                                            }).lean().exec(function (errExtraSites, extraSitesData) {
                                                if (errExtraSites)
                                                    throw errExtraSites;
                                                // Desnormalize result of sites
                                                var sitesDesnormalized = [];
                                                elementsDesnormalized = []

                                                for (i = 0; i < extraSitesData.length; i++) {
                                                    elementsDesnormalized = elementsDesnormalized.concat(extraSitesData[i].elements);
                                                    if (extraSitesData[i].sites) {
                                                        for (j = 0; j < extraSitesData[i].sites.length; j++) {
                                                            var organization = extraSitesData[i];
                                                            var elements = organization.elements;
                                                            var site = organization.sites[j];
                                                            sitesDesnormalized.push({
                                                                organization: organization,
                                                                site: site,
                                                                elements: elements
                                                            });
                                                        }
                                                    }
                                                }

                                                elementsDesnormalized = _.uniq(elementsDesnormalized);


                                                //Filter sites which are not in the sites array that were sent to the user
                                                sitesDesnormalized = _.filter(sitesDesnormalized, function (site) {
                                                    return !_.contains(sitesInUserCellphone, site.site.identifier) && site.site.isReady == 1;
                                                });

                                                for (var i = 0; i < biins.length; i++) {
                                                    for (var j = 0; j < biins[i].objects.length; j++) {
                                                        var el = null;
                                                        if (mobileUser.biinieCollections && mobileUser.biinieCollections[DEFAULT_COLLECTION] && mobileUser.biinieCollections[DEFAULT_COLLECTION].elements)
                                                            el = _.findWhere(mobileUser.biinieCollections[DEFAULT_COLLECTION].elements, {identifier: biins[i].objects[j].identifier});
                                                        biins[i].objects[j].isUserNotified = '0';
                                                        biins[i].objects[j].isCollected = el ? '1' : '0';
                                                    }
                                                }

                                                //adding organization and proximity to the sites
                                                for (i = 0; i < sitesDesnormalized.length; i++) {
                                                    sitesDesnormalized[i].site.organizationIdentifier = sitesDesnormalized[i].organization.identifier;
                                                    sitesDesnormalized[i].site.proximity = utils.getProximity(mobileUserData.lastLocation[1] + "", mobileUserData.lastLocation[0] + "", sitesDesnormalized[i].site.lat, sitesDesnormalized[i].site.lng);
                                                    var biinsSite = _.filter(biins, function (biin) {
                                                        return biin.siteIdentifier == sitesDesnormalized[i].site.identifier;
                                                    });
                                                    sitesDesnormalized[i].site.biins = biinsSite;
                                                }

                                                sitesDesnormalized = _.filter(sitesDesnormalized, function (site) {
                                                    return site.site.biins.length > 0;
                                                });

                                                //sort to the closest sites
                                                var sortByProximity = _.sortBy(sitesDesnormalized, function (site) {
                                                    return site.site.proximity;
                                                });


                                                showcasesToFind = [];
                                                for (var i = 0; i < sortByProximity.length; i++) {
                                                    for (var j = 0; j < sortByProximity[i].site.showcases.length; j++) {
                                                      showcasesToFind.push(sortByProximity[i].site.showcases[j].showcaseIdentifier);
                                                    }
                                                }
                                                showcasesToFind = _.uniq(showcasesToFind);

                                                showcase.find({identifier: {$in: showcasesToFind}},
                                                    {
                                                        "name": 1,
                                                        "description": 1,
                                                        "identifier": 1,
                                                        "isReady": 1
                                                    }).lean().exec(function (showcaseError, showcaseDataFromSitesToSent) {


                                                    //TODO:ADD showcase data

                                                    for (var i = 0; i < sortByProximity.length; i++) {
                                                        for (var j = 0; j < sortByProximity[i].site.showcases.length; j++) {
                                                            sortByProximity[i].site.showcases[j].identifier = sortByProximity[i].site.showcases[j].showcaseIdentifier;
                                                            delete sortByProximity[i].site.showcases[j].showcaseIdentifier;

                                                            var showcaseData = _.find(showcaseDataFromSitesToSent, function (showcase) {
                                                                return showcase.identifier == sortByProximity[i].site.showcases[j].identifier;
                                                            });
                                                            sortByProximity[i].site.showcases[j].title = showcaseData.name;
                                                            sortByProximity[i].site.showcases[j].subTitle = showcaseData.description;
                                                            sortByProximity[i].site.showcases[j].isReady = showcaseData.isReady;
                                                        }
                                                        sortByProximity[i].site.showcases = _.filter(sortByProximity[i].site.showcases, function (showcase) {
                                                            return showcase.isReady == 1;
                                                        });
                                                    }


                                                    var elementsInShowcase = [];

                                                    for (i = 0; i < sortByProximity.length; i++) {
                                                        for (j = 0; j < sortByProximity[i].site.showcases.length; j++) {
                                                            for (var k = 0; k < sortByProximity[i].site.showcases[j].elements.length; k++) {
                                                                elementData = _.findWhere(elementsDesnormalized, {elementIdentifier: sortByProximity[i].site.showcases[j].elements[k].identifier});
                                                                sortByProximity[i].site.showcases[j].elements[k].isReady = elementData.isReady;
                                                            }

                                                            sortByProximity[i].site.showcases[j].elements = _.filter(sortByProximity[i].site.showcases[j].elements, function (element) {
                                                                return element.isReady == 1;
                                                            });

                                                            var elementsToConcat = sortByProximity[i].site.showcases[j].elements;
                                                            _.each(elementsToConcat, function (element) {
                                                                element.showcase_id = sortByProximity[i].site.showcases[j]._id;
                                                            });

                                                            if (sortByProximity[i].site.showcases[j].elements.length == 0) {
                                                                sortByProximity[i].site.showcases.splice(j, 1);
                                                                j--;
                                                            } else {
                                                                sortByProximity[i].site.showcases[j].elements_quantity = sortByProximity[i].site.showcases[j].elements.length + "";
                                                                sortByProximity[i].site.showcases[j].elements = sortByProximity[i].site.showcases[j].elements.splice(0, LIMIT_ELEMENTS_IN_SHOWCASE);
                                                                elementsInShowcase = elementsInShowcase.concat(sortByProximity[i].site.showcases[j].elements);
                                                            }
                                                        }
                                                    }

                                                    // Obtain an array with the element's identifier and convert it into a unique list
                                                    var elementsIdentifierFromShowcase = _.pluck(elementsInShowcase, 'identifier');
                                                    var uniqueElementsIdentifierFromShowcase = _.uniq(elementsIdentifierFromShowcase);




                                                    var elementsInShowcase = [];
                                                    var elementsRemovedFromShowcase = [];
                                                    var elementsToAddInCategories = 0;

                                                    var elementsWithSiteRef = [];
                                                    //TODO: OPTIMIZE THIS ITS On3






                                                    //Get Elements from  the showcases of the sites
                                                    for (i = 0; i < sortByProximity.length; i++) {
                                                        for (j = 0; j < sortByProximity[i].site.showcases.length; j++) {
                                                            var elementsToSend = sortByProximity[i].site.showcases[j].elements.splice(0, LIMIT_ELEMENTS_IN_SHOWCASE);

                                                            sortByProximity[i].site.showcases[j].elements = elementsToSend;
                                                            elementsInShowcase = elementsInShowcase.concat(sortByProximity[i].site.showcases[j].elements);

                                                            for (var k = 0; k < elementsToSend.length; k++) {
                                                                var element = elementsToSend[k];
                                                                element.showcase_id = sortByProximity[i].site.showcases[j]._id;
                                                                element.siteId = sortByProximity[i].site.identifier;
                                                                element.orgElements = sortByProximity[i].elements;
                                                                elementsWithSiteRef.push(element);
                                                            }
                                                        }
                                                    }
                                                    var sitesIdToSend = [];
                                                    var elementsThatContainsCategory = [];
                                                    for (i = 0; i < elementsWithSiteRef.length; i++) {
                                                        var element = _.find(elementsWithSiteRef[i].orgElements, function (element) {
                                                            return element.elementIdentifier == elementsWithSiteRef[i].identifier;
                                                        });
                                                        if (element) {
                                                            category = _.find(element.categories, function (category) {
                                                                return category.identifier == categoryId;
                                                            });
                                                            if (category) {
                                                                elementsToAddInCategories++;
                                                                sitesIdToSend.push(elementsWithSiteRef[i].siteId);
                                                                element.showcaseID = elementsWithSiteRef[i]._id;
                                                                element.showcase_id = elementsWithSiteRef[i].showcase_id;
                                                                elementsThatContainsCategory.push(element);
                                                                if (elementsToAddInCategories == amountOfExtraElementsNeeded) {
                                                                    break;
                                                                }
                                                            }
                                                        }
                                                    }

                                                    sitesIdToSend = _.uniq(sitesIdToSend);

                                                    sortByProximity = _.filter(sortByProximity, function (site) {
                                                        return _.contains(sitesIdToSend, site.site.identifier);
                                                    });
                                                    var elementsInBiinsObjects = [];
                                                    for (i = 0; i < sortByProximity.length; i++) {
                                                        for (j = 0; j < sortByProximity[i].site.biins.length; j++) {
                                                            for (k = 0; k < sortByProximity[i].site.biins[j].objects.length; k++) {
                                                                if (sortByProximity[i].site.biins[j].objects[k].name == "element") {
                                                                    elementsInBiinsObjects.push(sortByProximity[i].site.biins[j].objects[k].identifier);
                                                                }
                                                            }
                                                        }
                                                    }


                                                    var showcasesToFind = [];
                                                    var elementsToSend = [];
                                                    var elementsData = [];


                                                    for (i = 0; i < sortByProximity.length; i++) {
                                                        for (var j = 0; j < sortByProximity[i].site.showcases.length; j++) {
                                                            showcasesToFind.push(sortByProximity[i].site.showcases[j].showcaseIdentifier);
                                                            var elementsToConcat = sortByProximity[i].site.showcases[j].elements;
                                                            _.each(elementsToConcat, function (element) {
                                                                element.showcase_id = sortByProximity[i].site.showcases[j]._id;
                                                            });
                                                            elementsToSend = elementsToSend.concat(elementsToConcat);
                                                            elementsData = elementsData.concat(sortByProximity[i].elements);
                                                        }
                                                    }
                                                    var elementsIds = _.pluck(elementsToSend, 'identifier');
                                                    elementsIds = elementsIds.concat(elementsInBiinsObjects);
                                                    var uniqueElementsToSend = _.uniq(elementsIds);

                                                    var elements = [];
                                                    for (i = 0; i < uniqueElementsToSend.length; i++) {
                                                        var elementData = _.find(elementsData, function (element) {
                                                            return uniqueElementsToSend[i] == element.elementIdentifier;
                                                        });
                                                        if (elementData)
                                                            elements.push(elementData);
                                                    }

                                                    var sites = [];
                                                    var organizations = [];
                                                    for (i = 0; i < sortByProximity.length; i++) {
                                                        sites.push(sortByProximity[i].site);
                                                        organizations.push(sortByProximity[i].organization);
                                                    }
                                                    organizations = _.uniq(organizations);
                                                    response.organizations = organizations;
                                                    //Fill organizations


                                                    var elementsWithCategory = [];
                                                    for (i = 0; i < elementsThatContainsCategory.length; i++) {
                                                        var element = {};
                                                        element._id = elementsThatContainsCategory[i].showcaseID;
                                                        element.identifier = elementsThatContainsCategory[i].elementIdentifier;
                                                        element.showcase_id = elementsThatContainsCategory[i].showcase_id;
                                                        elementsWithCategory.push(element);
                                                    }

                                                    var sitesSent = [];
                                                    var organizationsSent = [];
                                                    var elementsSent = [];

                                                    response.sites = sites;

                                                    for (i = 0; i < response.sites.length; i++) {
                                                        response.sites[i] = validateSiteInitialInfo(response.sites[i]);
                                                        sitesSent.push({identifier: response.sites[i].identifier});
                                                    }
                                                    for (i = 0; i < response.organizations.length; i++) {
                                                        response.organizations[i] = validateOrganizationInitialInfo(response.organizations[i]);
                                                        organizationsSent.push({identifier: response.organizations[i].identifier});
                                                    }

                                                    response.elements = response.elements.concat(elements);

                                                    for (i = 0; i < response.elements.length; i++) {

                                                        var isUserCollect = false;
                                                        for (var j = 0; j < data.biinieCollections.length && !isUserCollect; j++) {
                                                            var elUserCollect = _.findWhere(data.biinieCollections[j].elements, {identifier: response.elements[i].elementIdentifier});
                                                            isUserCollect = elUserCollect != null;
                                                        }

                                                        var userShareElements = _.filter(data.shareObjects, function (like) {
                                                            return like.type === "element"
                                                        });
                                                        var elUserShared = _.findWhere(userShareElements, {identifier: response.elements[i].elementIdentifier});
                                                        var isUserShared = elUserShared != null;

                                                        var userLikeElements = _.filter(data.likeObjects, function (like) {
                                                            return like.type === "element"
                                                        });
                                                        var elUserLike = _.findWhere(userLikeElements, {identifier: response.elements[i].elementIdentifier});
                                                        var isUserLike = elUserLike != null;

                                                        var userFollowElements = _.filter(data.followObjects, function (like) {
                                                            return like.type === "element"
                                                        });
                                                        var elUserFollow = _.findWhere(userFollowElements, {identifier: response.elements[i].elementIdentifier});
                                                        var isUserFollow = elUserFollow != null;

                                                        var elUserViewed = _.findWhere(data.seenElements, {elementIdentifier: response.elements[i].elementIdentifier});
                                                        var isUserViewedElement = elUserViewed != null;

                                                        response.elements[i].userShared = isUserShared ? "1" : "0";
                                                        response.elements[i].userFollowed = isUserFollow ? "1" : "0";
                                                        response.elements[i].userLiked = isUserLike ? "1" : "0";
                                                        response.elements[i].userCollected = isUserCollect ? "1" : "0";
                                                        response.elements[i].userViewed = isUserViewedElement ? "1" : "0";
                                                    }

                                                    for (var i = 0; i < response.elements.length; i++) {
                                                        response.elements[i] = validateElementInitialInfo(response.elements[i]);
                                                        elementsSent.push({identifier: response.elements[i].identifier});
                                                    }

                                                    response.elementsForCategory = elementsForCategory.concat(elementsWithCategory);

                                                    res.json({data: response, "status": "0", "result": "1"});
                                                    saveInfoIntoUserMobileSession(userIdentifier, response.sites, response.elements, {
                                                        'identifier': categoryId,
                                                        'elements': elementsForCategory
                                                    }, response.organization);
                                                });
                                            });

                                        } else {
                                            // Otherwise will be sent just only the elements
                                            var elementsToSend = elementsWithinCategory.splice(0, ELEMENTS_IN_CATEGORY);

                                            // Obtaing _id for the nearest Showcase and adding into the group id
                                            var elementsForCategory = [];
                                            for (i = 0; i < elementsToSend.length; i++) {
                                                for (j = 0; j < elementsInShowcase.length; j++) {
                                                    if (elementsToSend[i].elementIdentifier == elementsInShowcase[j].identifier) {
                                                        elementsForCategory.push({
                                                            showcase_id: elementsInShowcase[j].showcase_id,
                                                            _id: elementsInShowcase[j]._id,
                                                            identifier: elementsToSend[i].elementIdentifier
                                                        });
                                                        response.elements.push(elementsToSend[i]);
                                                        break;
                                                    }
                                                }
                                            }

                                            response.elementsForCategory = elementsForCategory;

                                            for (i = 0; i < response.elements.length; i++) {

                                                var isUserCollect = false;
                                                for (var j = 0; j < data.biinieCollections.length && !isUserCollect; j++) {
                                                    var elUserCollect = _.findWhere(data.biinieCollections[j].elements, {identifier: response.elements[i].elementIdentifier});
                                                    isUserCollect = elUserCollect != null;
                                                }

                                                var userShareElements = _.filter(data.shareObjects, function (like) {
                                                    return like.type === "element"
                                                });
                                                var elUserShared = _.findWhere(userShareElements, {identifier: response.elements[i].elementIdentifier});
                                                var isUserShared = elUserShared != null;

                                                var userLikeElements = _.filter(data.likeObjects, function (like) {
                                                    return like.type === "element"
                                                });
                                                var elUserLike = _.findWhere(userLikeElements, {identifier: response.elements[i].elementIdentifier});
                                                var isUserLike = elUserLike != null;

                                                var userFollowElements = _.filter(data.followObjects, function (like) {
                                                    return like.type === "element"
                                                });
                                                var elUserFollow = _.findWhere(userFollowElements, {identifier: response.elements[i].elementIdentifier});
                                                var isUserFollow = elUserFollow != null;

                                                var elUserViewed = _.findWhere(data.seenElements, {elementIdentifier: response.elements[i].elementIdentifier});
                                                var isUserViewedElement = elUserViewed != null;

                                                response.elements[i].userShared = isUserShared ? "1" : "0";
                                                response.elements[i].userFollowed = isUserFollow ? "1" : "0";
                                                response.elements[i].userLiked = isUserLike ? "1" : "0";
                                                response.elements[i].userCollected = isUserCollect ? "1" : "0";
                                                response.elements[i].userViewed = isUserViewedElement ? "1" : "0";
                                            }


                                            for (i = 0; i < response.elements.length; i++) {
                                                response.elements[i] = validateElementInitialInfo(response.elements[i]);
                                            }
                                            res.json({data: response, "status": "0", "result": "1"});
                                            saveInfoIntoUserMobileSession(userIdentifier, response.sites, response.elements, {
                                                'identifier': categoryId,
                                                'elements': elementsForCategory
                                            }, response.organizations);

                                        }
                                    });
                            });
                        });
                    } else {
                        res.json({data: {}, "status": "2", "result": "0"});
                    }
                });
            });
        });
    };

    functions.getNextSites = function (req, res) {
        var userIdentifier = req.params["identifier"];
        var MAX_SITES = process.env.SITES_INITIAL_DATA || 10;
        var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
        var DEFAULT_COLLECTION = 0;
        var response = {};
        response.sites = [];
        response.organizations = [];
        mobileUser.findOne({'identifier': userIdentifier}, {
            'showcaseNotified': 1,
            'biinieCollections': 1,
            'loyalty': 1,
            "likeObjects": 1,
            "followObjects": 1,
            "biinieCollect": 1,
            "shareObjects": 1
        }, function (errBiinie, userData) {
            if (errBiinie)
                throw errBiinie;
            biin.find({status: "Installed"}, {}).lean().exec(function (errBiin, biins) {
                if (errBiin)
                    throw errBiin;

                mobileSession.findOne({identifier: userIdentifier}, {
                    "sites.userComments": 0,
                    "sites.userLiked": 0,
                    "sites.userCollected": 0,
                    "sites.userFollowed": 0,
                    "sites.userShared": 0,
                    "sites.biinedUsers": 0
                }).lean().exec(function (errMobileSession, mobileUserData) {
                    if (errMobileSession)
                        throw errMobileSession;
                    if (mobileUserData) {
                        //Get sites sent to the user
                        var sitesInUserCellphone = _.pluck(mobileUserData.sitesSent, 'identifier');

                        //Get extra site informmation
                        organization.find({'sites.identifier': {$nin: sitesInUserCellphone}}, {
                            "sites.userComments": 0,
                            "sites.userLiked": 0,
                            "sites.userCollected": 0,
                            "sites.userFollowed": 0,
                            "sites.userShared": 0,
                            "sites.biinedUsers": 0
                        }).lean().exec(function (errExtraSites, extraSitesData) {
                            if (errExtraSites)
                                throw errExtraSites;
                            // Desnormalize result of sites
                            var sitesDesnormalized = [];
                            var elementsData = [];
                            var orgData = [];

                            for (var i = 0; i < extraSitesData.length; i++) {
                                if (extraSitesData[i].sites) {
                                    for (var j = 0; j < extraSitesData[i].sites.length; j++) {
                                        var organization = extraSitesData[i];
                                        var elements = organization.elements;
                                        var site = organization.sites[j];
                                        sitesDesnormalized.push({
                                            organization: organization,
                                            site: site,
                                            elements: elements
                                        });
                                    }
                                }
                            }
                            //Filter sites which are not in the sites array that were sent to the user
                            sitesDesnormalized = _.filter(sitesDesnormalized, function (site) {
                                return !_.contains(sitesInUserCellphone, site.site.identifier);
                            });

                            sitesDesnormalized = _.filter(sitesDesnormalized, function (site) {
                                return site.site.isReady == 1;
                            });

                            for (var i = 0; i < biins.length; i++) {
                                for (var j = 0; j < biins[i].objects.length; j++) {
                                    var el = null;
                                    if (userData.biinieCollections && userData.biinieCollections[DEFAULT_COLLECTION] && userData.biinieCollections[DEFAULT_COLLECTION].elements)
                                        el = _.findWhere(userData.biinieCollections[DEFAULT_COLLECTION].elements, {identifier: biins[i].objects[j].identifier});
                                    biins[i].objects[j].isUserNotified = '0';
                                    biins[i].objects[j].isCollected = el ? '1' : '0';
                                }
                            }

                            //adding organization and proximity to the sites
                            for (i = 0; i < sitesDesnormalized.length; i++) {
                                sitesDesnormalized[i].site.organizationIdentifier = sitesDesnormalized[i].organization.identifier;
                                sitesDesnormalized[i].site.proximity = utils.getProximity(mobileUserData.lastLocation[1] + "", mobileUserData.lastLocation[0] + "", sitesDesnormalized[i].site.lat, sitesDesnormalized[i].site.lng);
                                var biinsSite = _.filter(biins, function (biin) {
                                    return biin.siteIdentifier == sitesDesnormalized[i].site.identifier;
                                });
                                sitesDesnormalized[i].site.biins = biinsSite;
                            }

                            sitesDesnormalized = _.filter(sitesDesnormalized, function (site) {
                                return site.site.biins.length > 0;
                            });

                            //sort to the closest sites
                            var sortByProximity = _.sortBy(sitesDesnormalized, function (site) {
                                return site.site.proximity;
                            });
                            sortByProximity = sortByProximity.splice(0, MAX_SITES);

                            for (i = 0; i < sortByProximity.length; i++) {
                                orgData.push(sortByProximity[i].organization);
                                elementsData = elementsData.concat(sortByProximity[i].elements);
                            }

                            response.sites = _.pluck(sortByProximity, 'site');

                            var elementsInBiinsObjects = [];
                            for (var i = 0; i < response.sites.length; i++) {
                                for (var j = 0; j < response.sites[i].biins.length; j++) {
                                    for (var k = 0; k < response.sites[i].biins[j].objects.length; k++) {
                                        if (response.sites[i].biins[j].objects[k].name == "element") {
                                            elementsInBiinsObjects.push(response.sites[i].biins[j].objects[k].identifier);
                                        }
                                    }
                                }
                            }

                            elementsInBiinsObjects = _.uniq(elementsInBiinsObjects);

                            var showcasesToFind = [];
                            for (i = 0; i < response.sites.length; i++) {
                                for (j = 0; j < response.sites[i].showcases.length; j++) {
                                    showcasesToFind.push(response.sites[i].showcases[j].showcaseIdentifier);
                                }
                            }

                            showcasesToFind = _.uniq(showcasesToFind);
                            showcase.find({identifier: {$in: showcasesToFind}},
                                {
                                    "name": 1,
                                    "description": 1,
                                    "identifier": 1,
                                    "isReady": 1
                                }).lean().exec(
                                function (showcasesError, showcasesData) {
                                    if (showcasesError)
                                        throw showcasesError;

                                    for (i = 0; i < response.sites.length; i++) {
                                        for (j = 0; j < response.sites[i].showcases.length; j++) {
                                            response.sites[i].showcases[j].identifier = response.sites[i].showcases[j].showcaseIdentifier;
                                            delete response.sites[i].showcases[j].showcaseIdentifier;

                                            var showcaseData = _.find(showcasesData, function (showcase) {
                                                return showcase.identifier == response.sites[i].showcases[j].identifier;
                                            });
                                            response.sites[i].showcases[j].title = showcaseData.name;
                                            response.sites[i].showcases[j].subTitle = showcaseData.description;
                                            response.sites[i].showcases[j].isReady = showcaseData.isReady;
                                        }
                                        response.sites[i].showcases = _.filter(response.sites[i].showcases, function (showcase) {
                                            return showcase.isReady == 1;
                                        });

                                    }

                                    var elementsInShowcase = [];

                                    for (i = 0; i < response.sites.length; i++) {
                                        for (j = 0; j < response.sites[i].showcases.length; j++) {
                                            for (var k = 0; k < response.sites[i].showcases[j].elements.length; k++) {
                                                elementData = _.findWhere(elementsData, {elementIdentifier: response.sites[i].showcases[j].elements[k].identifier});
                                                response.sites[i].showcases[j].elements[k].isReady = elementData.isReady;
                                            }

                                            response.sites[i].showcases[j].elements = _.filter(response.sites[i].showcases[j].elements, function (element) {
                                                return element.isReady == 1;
                                            })
                                            if (response.sites[i].showcases[j].elements.length == 0) {
                                                response.sites[i].showcases.splice(j, 1);
                                                j--;
                                            } else {
                                                response.sites[i].showcases[j].elements_quantity = response.sites[i].showcases[j].elements.length + "";
                                                response.sites[i].showcases[j].elements = response.sites[i].showcases[j].elements.splice(0, LIMIT_ELEMENTS_IN_SHOWCASE);
                                                elementsInShowcase = elementsInShowcase.concat(response.sites[i].showcases[j].elements);
                                            }
                                        }
                                    }

                                    var uniqueElementsShowcase = _.pluck(elementsInShowcase, 'identifier');
                                    uniqueElementsShowcase = _.uniq(uniqueElementsShowcase);

                                    elementsData = _.uniq(elementsData);

                                    uniqueElementsShowcase = uniqueElementsShowcase.concat(elementsInBiinsObjects);
                                    uniqueElementsShowcase = _.uniq(uniqueElementsShowcase);

                                    var elementsfiltered = _.filter(elementsData, function (element) {
                                        return uniqueElementsShowcase.indexOf(element.elementIdentifier) > -1;
                                    });

                                    for (i = 0; i < elementsfiltered.length; i++) {

                                        var isUserCollect = false;
                                        for (var j = 0; j < userData.biinieCollections.length && !isUserCollect; j++) {
                                            var elUserCollect = _.findWhere(userData.biinieCollections[j].elements, {identifier: elementsfiltered[i].elementIdentifier});
                                            isUserCollect = elUserCollect != null;
                                        }

                                        var userShareElements = _.filter(userData.shareObjects, function (like) {
                                            return like.type === "element"
                                        });
                                        var elUserShared = _.findWhere(userShareElements, {identifier: elementsfiltered[i].elementIdentifier});
                                        var isUserShared = elUserShared != null;

                                        var userLikeElements = _.filter(userData.likeObjects, function (like) {
                                            return like.type === "element"
                                        });
                                        var elUserLike = _.findWhere(userLikeElements, {identifier: elementsfiltered[i].elementIdentifier});
                                        var isUserLike = elUserLike != null;

                                        var userFollowElements = _.filter(userData.followObjects, function (like) {
                                            return like.type === "element"
                                        });
                                        var elUserFollow = _.findWhere(userFollowElements, {identifier: elementsfiltered[i].elementIdentifier});
                                        var isUserFollow = elUserFollow != null;

                                        var elUserViewed = _.findWhere(userData.seenElements, {elementIdentifier: elementsfiltered[i].elementIdentifier});
                                        var isUserViewedElement = elUserViewed != null;

                                        elementsfiltered[i].userShared = isUserShared ? "1" : "0";
                                        elementsfiltered[i].userFollowed = isUserFollow ? "1" : "0";
                                        elementsfiltered[i].userLiked = isUserLike ? "1" : "0";
                                        elementsfiltered[i].userCollected = isUserCollect ? "1" : "0";
                                        elementsfiltered[i].userViewed = isUserViewedElement ? "1" : "0";
                                    }

                                    var sitesSent = [];
                                    var organizationsSent = [];
                                    var elementsSent = [];

                                    orgData = _.uniq(orgData);

                                    for (i = 0; i < response.sites.length; i++) {
                                        response.sites[i] = validateSiteInitialInfo(response.sites[i]);
                                        sitesSent.push({identifier: response.sites[i].identifier});
                                    }
                                    for (i = 0; i < orgData.length; i++) {
                                        orgData[i] = validateOrganizationInitialInfo(orgData[i]);
                                        organizationsSent.push({identifier: orgData[i].identifier});
                                    }
                                    for (i = 0; i < elementsfiltered.length; i++) {
                                        elementsfiltered[i] = validateElementInitialInfo(elementsfiltered[i]);
                                        elementsSent.push({identifier: elementsfiltered[i].identifier});
                                    }

                                    response.organizations = orgData;
                                    response.elements = elementsfiltered;

                                    res.json({data: response, "status": "0", "result": "1"});
                                    saveInfoIntoUserMobileSession(userIdentifier, response.sites, response.elements, null, response.organization);
                                });
                        });

                    } else {
                        res.json({data: {}, "status": "2", "result": "0"});
                    }
                });
            });
        });
    };

    functions.getCollections = function (req, res) {
        //res.json(collectionData);

        res.setHeader('Content-Type', 'application/json');
        var identifier = req.params.identifier;
        var response = {};
        response.sites = [];
        response.organizations = [];
        response.collections = [];
        response.elements = [];

        var DEFAULT_COLLECTION = 0;

        mobileUser.findOne({"identifier": identifier}, {
            _id: 0, 'gender': 1,
            'showcaseNotified': 1,
            'biinieCollections': 1,
            'loyalty': 1,
            "likeObjects": 1,
            "followObjects": 1,
            "biinieCollect": 1,
            "shareObjects": 1
        }).lean().exec(function (err, data) {
            if (err)
                throw err;

            biin.find({status: "Installed"}, {}).lean().exec(function (errBiin, biins) {
                if (errBiin)
                    throw errBiin;
                mobileSession.findOne({identifier: identifier}, {}).lean().exec(function (errMobileSession, mobileUserData) {
                    if (errMobileSession)
                        throw errMobileSession;

                    var elementsUserCollected = [];
                    var elementsShowcaseRelationID = [];
                    for (var i = 0; i < data.biinieCollections.length; i++) {
                        var collections = data.biinieCollections[i];
                        for (var j = 0; j < collections.elements.length; j++) {
                            elementsUserCollected.push(collections.elements[j].identifier);
                            elementsShowcaseRelationID.push({
                                _id: collections.elements[j]._id,
                                identifier: collections.elements[j].identifier
                            });
                        }
                    }
                    organization.find({'elements.elementIdentifier': {$in: elementsUserCollected}}, {
                        "sites.userComments": 0,
                        "sites.userLiked": 0,
                        "sites.userCollected": 0,
                        "sites.userFollowed": 0,
                        "sites.userShared": 0,
                        "sites.biinedUsers": 0
                    }).lean().exec(function (errSites, sitesData) {
                        if (errSites)
                            throw errSites;
                        var elementsFromOrganizations = [];
                        var sitesFromOrganization = [];

                        for (i = 0; i < sitesData.length; i++) {
                            var orgId = sitesData[i].identifier;

                            for (j = 0; j < sitesData[i].sites.length; j++) {
                                sitesData[i].sites[j].organizationIdentifier = orgId;
                            }
                        }

                        for (i = 0; i < sitesData.length; i++) {
                            elementsFromOrganizations = elementsFromOrganizations.concat(sitesData[i].elements);
                            sitesFromOrganization = sitesFromOrganization.concat(sitesData[i].sites);
                        }
                        for (i = 0; i < sitesFromOrganization.length; i++) {
                            for (j = 0; j < sitesFromOrganization[i].showcases.length; j++) {
                                sitesFromOrganization[i].showcases[j].elements_quantity = sitesFromOrganization[i].showcases[j].elements.length + "";
                            }
                        }

                        for (i = 0; i < biins.length; i++) {
                            for (j = 0; j < biins[i].objects.length; j++) {
                                var el = null;
                                if (data.biinieCollections && data.biinieCollections[DEFAULT_COLLECTION] && data.biinieCollections[DEFAULT_COLLECTION].elements)
                                    el = _.findWhere(data.biinieCollections[DEFAULT_COLLECTION].elements, {identifier: biins[i].objects[j].identifier});
                                biins[i].objects[j].isUserNotified = '0';
                                biins[i].objects[j].isCollected = el ? '1' : '0';
                            }
                        }

                        for (i = 0; i < sitesFromOrganization.length; i++) {
                            var biinsSite = _.filter(biins, function (biin) {
                                return biin.siteIdentifier == sitesFromOrganization[i].identifier;
                            });
                            sitesFromOrganization[i].biins = biinsSite;
                        }

                        var showcases = [];
                        for (i = 0; i < sitesFromOrganization.length; i++) {
                            showcases = showcases.concat(sitesFromOrganization[i].showcases)
                        }
                        var elementsInShowcase = [];
                        for (i = 0; i < showcases.length; i++) {
                            elementsInShowcase = elementsInShowcase.concat(showcases[i].elements);
                        }
                        elementsInShowcase = _.pluck(elementsInShowcase, 'identifier');

                        elementsInShowcase = _.uniq(elementsInShowcase);

                        elementsInShowcase = _.difference(elementsInShowcase, elementsUserCollected);


                        var showcasesWithCollectedElements = [];

                        for (i = 0; i < elementsShowcaseRelationID.length; i++) {
                            var showcase = null;

                            for (j = 0; j < showcases.length; j++) {
                                for (var k = 0; k < showcases[j].elements.length; k++) {
                                    if (showcases[j].elements[k].identifier == elementsShowcaseRelationID[i].identifier) {
                                        showcase = showcases[j];
                                        break;
                                    }
                                }
                                if (showcase)
                                    break;
                            }

                            if (showcase) {
                                showcasesWithCollectedElements.push(showcase);
                                elementsShowcaseRelationID[i].showcase_id = showcase._id;
                                elementsShowcaseRelationID[i].isRemovedFromShowcase = "0";
                            } else {
                                elementsShowcaseRelationID[i].showcase_id = "";
                                elementsShowcaseRelationID[i].isRemovedFromShowcase = "1";
                            }
                        }

                        for (i = 0; i < data.biinieCollections.length; i++) {
                            for (j = 0; j < data.biinieCollections[i].elements.length; j++) {
                                var elementWithData = _.findWhere(elementsShowcaseRelationID, {identifier: data.biinieCollections[i].elements[j].identifier});
                                data.biinieCollections[i].elements[j] = elementWithData;
                            }
                            data.biinieCollections[i].elements = _.uniq(data.biinieCollections[i].elements);
                        }

                        response.collections = data.biinieCollections;


                        var sitesWithCollectedElementsInShowcases = [];

                        for (i = 0; i < sitesFromOrganization.length; i++) {
                            var site = null;
                            for (var j = 0; j < sitesFromOrganization[i].showcases.length; j++) {
                                for (var k = 0; k < showcasesWithCollectedElements.length; k++) {
                                    if (showcasesWithCollectedElements[k]._id == sitesFromOrganization[i].showcases[j]._id) {
                                        site = sitesFromOrganization[i];
                                        break;
                                    }
                                    if (site)
                                        break;
                                }
                            }
                            if (site)
                                sitesWithCollectedElementsInShowcases.push(site);
                        }

                        sitesWithCollectedElementsInShowcases = _.uniq(sitesWithCollectedElementsInShowcases);
                        var elementsInBiinsObjects = [];
                        for (i = 0; i < sitesWithCollectedElementsInShowcases.length; i++) {
                            for (j = 0; j < sitesWithCollectedElementsInShowcases[i].biins.length; j++) {
                                for (var k = 0; k < sitesWithCollectedElementsInShowcases[i].biins[j].objects.length; k++) {
                                    if (sitesWithCollectedElementsInShowcases[i].biins[j].objects[k].name == "element")
                                        elementsInBiinsObjects.push(sitesWithCollectedElementsInShowcases[i].biins[j].objects[k].identifier);
                                }
                            }
                        }

                        var organizationsWithCollectedElements = [];
                        for (i = 0; i < sitesWithCollectedElementsInShowcases.length; i++) {
                            var org = null;
                            for (j = 0; j < sitesData.length; j++) {
                                for (k = 0; k < sitesData[j].sites.length; k++) {
                                    if (sitesData[j].sites[k].identifier == sitesWithCollectedElementsInShowcases[i].identifier) {
                                        org = sitesData[j];
                                        break;
                                    }
                                }
                                if (org)
                                    break;
                            }
                            organizationsWithCollectedElements.push(org);
                        }
                        organizationsWithCollectedElements = _.uniq(organizationsWithCollectedElements);

                        for (i = 0; i < sitesWithCollectedElementsInShowcases.length; i++) {
                            sitesWithCollectedElementsInShowcases[i] = validateSiteInitialInfo(sitesWithCollectedElementsInShowcases[i]);
                        }
                        for (i = 0; i < organizationsWithCollectedElements.length; i++) {
                            organizationsWithCollectedElements[i] = validateOrganizationInitialInfo(organizationsWithCollectedElements[i]);
                        }

                        var elementsData = _.filter(elementsFromOrganizations, function (element) {
                            return _.contains(elementsUserCollected, element.elementIdentifier);
                        });

                        var elementsFromShowcasesData = _.filter(elementsFromOrganizations, function (element) {
                            return _.contains(elementsInShowcase, element.elementIdentifier);
                        });

                        var elementsInBiinsObjects = _.filter(elementsFromOrganizations, function (element) {
                            return _.contains(elementsInBiinsObjects, element.elementIdentifier);
                        });

                        elementsData = elementsData.concat(elementsFromShowcasesData);
                        elementsData = elementsData.concat(elementsInBiinsObjects);

                        elementsData = _.uniq(elementsData);

                        for (i = 0; i < elementsData.length; i++) {

                            var isUserCollect = false;
                            for (var j = 0; j < data.biinieCollections.length && !isUserCollect; j++) {
                                var elUserCollect = _.findWhere(data.biinieCollections[j].elements, {identifier: elementsData[i].elementIdentifier});
                                isUserCollect = elUserCollect != null;
                            }

                            var userShareElements = _.filter(data.shareObjects, function (like) {
                                return like.type === "element"
                            });
                            var elUserShared = _.findWhere(userShareElements, {identifier: elementsData[i].elementIdentifier});
                            var isUserShared = elUserShared != null;

                            var userLikeElements = _.filter(data.likeObjects, function (like) {
                                return like.type === "element"
                            });
                            var elUserLike = _.findWhere(userLikeElements, {identifier: elementsData[i].elementIdentifier});
                            var isUserLike = elUserLike != null;

                            var userFollowElements = _.filter(data.followObjects, function (like) {
                                return like.type === "element"
                            });
                            var elUserFollow = _.findWhere(userFollowElements, {identifier: elementsData[i].elementIdentifier});
                            var isUserFollow = elUserFollow != null;

                            var elUserViewed = _.findWhere(data.seenElements, {elementIdentifier: elementsData[i].elementIdentifier});
                            var isUserViewedElement = elUserViewed != null;

                            elementsData[i].userShared = isUserShared ? "1" : "0";
                            elementsData[i].userFollowed = isUserFollow ? "1" : "0";
                            elementsData[i].userLiked = isUserLike ? "1" : "0";
                            elementsData[i].userCollected = isUserCollect ? "1" : "0";
                            elementsData[i].userViewed = isUserViewedElement ? "1" : "0";
                        }


                        for (i = 0; i < elementsData.length; i++) {
                            elementsData[i] = validateElementInitialInfo(elementsData[i]);
                        }
                        elementsData = _.uniq(elementsData);

                        response.sites = sitesWithCollectedElementsInShowcases;
                        response.elements = elementsData;
                        response.organizations = organizationsWithCollectedElements;

                        res.json({data: response, "status": "0", "result": "1"});
                    });
                });
            });
        });
    }



    function saveInfoIntoUserMobileSession(userIdentifier, sitesArray, elementsSent, elementsByCategorySent, organizationsSent) {
        mobileSession.findOne({identifier: userIdentifier}, {}, function (error, userSessionData) {
            if (error)
                throw error;
            else {


                var sitesToSave = _.filter(sitesArray, function (site) {
                    return _.find(userSessionData.sitesSent, function (siteSent) {
                            return siteSent.identifier == site.identifier;
                        }) == null;
                });

                var elementsToSave = _.filter(elementsSent, function (element) {
                    return _.find(userSessionData.elementsSent, function (elementSent) {
                            return elementSent.identifier == element.identifier;
                        }) == null;
                });

                var organizationsToSave = _.filter(organizationsSent, function (organization) {
                    return _.find(userSessionData.organizatonsSent, function (organizationSent) {
                            return organizationSent.identifier == organization.identifier;
                        }) == null;
                });

                userSessionData.sitesSent = userSessionData.sitesSent.concat(sitesToSave);
                userSessionData.elementsSent = userSessionData.elementsSent.concat(elementsToSave);
                userSessionData.organizatonsSent = userSessionData.organizatonsSent.concat(organizationsToSave);

                if (elementsByCategorySent) {
                    elementsByCategorySent.elements = _.pluck(elementsByCategorySent.elements, 'identifier');
                    categoryToUpdate = _.find(userSessionData.elementsSentByCategory, {identifier: elementsByCategorySent.identifier});
                    if (categoryToUpdate) {
                        categoryToUpdate.elementsSent = categoryToUpdate.elementsSent.concat(elementsByCategorySent.elements);
                        for (var i = 0; i < userSessionData.elementsSentByCategory.length; i++) {
                            if (userSessionData.elementsSentByCategory[i].identifier == elementsByCategorySent.identifier) {
                                userSessionData.elementsSentByCategory[i] = categoryToUpdate;
                            }
                        }
                    } else {
                        userSessionData.elementsSentByCategory.push(elementsByCategorySent);
                    }
                }
                userSessionData.save(function (error) {
                    if (error)
                        throw error;
                });
            }
        });
    }

    functions.getInitalDataFullCategories = function(req,res){
      var userIdentifier = req.param("biinieId");
      var userLat = eval(req.param("latitude"));
      var userLng = eval(req.param("longitude"));
      var MAX_SITES = process.env.SITES_INITIAL_DATA || 10;
      var ELEMENTS_IN_CATEGORY = process.env.ELEMENTS_IN_CATEGORY || 7;
      var LIMIT_HIGHLIGHTS_TO_SENT = process.env.LIMIT_HIGHLIGHTS_TO_SENT || 6;
      var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
      var DEFAULT_COLLECTION = 0;
      var response = {};
      var organizations = [];
      var elements = [];
      var highlights = [];
      var categories = [];
      var sites = [];

      var startedTime = Date.now();

      category.find({},{identifier:1},function(categoryErr,categoriesData){
        var currenttime = Date.now();
        console.log((currenttime-startedTime)/1000);
        if(categoryErr)
          res.json({data:{}, "status": "1", "result": "0" });
        else{
          _.each(categoriesData,function(category){
            categories.push({identifier:category.identifier,elements:[]});
          });
          organization.find({},{},function(elementsErr,elementsData){
            var currenttime = Date.now();
            console.log((currenttime-startedTime)/1000);
            if(elementsErr)
              res.json({data:{}, "status": "2", "result": "0" });
            else{
              var elementsDesnormalized = [];
              _.each(elementsData,function(organization){
                elementsDesnormalized = elementsDesnormalized.concat(organization.elements);
              });

              elementsDesnormalized = _.filter(elementsDesnormalized,function(element){
                return element.isReady == 1 && element.isDeleted == 0;
              });

              elementsDesnormalized = _.sortBy(elementsDesnormalized, function(element){ return element.isHighlight == "1" ? 0 : 1; });

              _.each(elementsDesnormalized,function(element){
                _.each(element.categories,function(category){
                    var cat = _.findWhere(categories,{identifier:category.identifier});
                    if(cat){
                      cat.elements.push({identifier:element.elementIdentifier});
                    }
                });
              });

              organization.find({},{sites:1},function(errSites,sitesData){
                var currenttime = Date.now();
                console.log((currenttime-startedTime)/1000);
                if(errSites)
                  res.json({data:{}, "status": "2", "result": "0" });
                else {
                  var sitesDesnormalized = [];
                  _.each(sitesData,function(organization){
                    sitesDesnormalized = sitesDesnormalized.concat(organization.sites);
                  });
                  sitesDesnormalized = _.filter(sitesDesnormalized,function(site){
                    return site.isReady == 1 && site.isDeleted == 0;
                  });
                  var showcasesInSites = [];
                  _.each(sitesDesnormalized,function(site){
                    showcasesInSites = showcasesInSites.concat(site.showcases);
                  });
                  showcasesToFind = _.pluck(showcasesInSites,'showcaseIdentifier');
                  showcase.find({identifier: {$in: showcasesToFind}},{},function(showcaseErr,showcasesData){
                    var currenttime = Date.now();
                    console.log((currenttime-startedTime)/1000);
                    if(showcaseErr)
                      res.json({data:{}, "status": "3", "result": "0" });
                    else {
                      var showcasesFiltered = _.filter(showcasesData,function(showcase){
                        return showcase.isReady == 1 && showcase.isDeleted == 0 && showcase.elements.length != 0;
                      });
                      showcasesInSites = _.filter(showcasesInSites,function(showcase){
                        return _.findWhere(showcasesFiltered,{identifier:showcase.showcaseIdentifier}) != null;
                      });

                      var elementsInShowcases = [];
                      _.each(showcasesInSites,function(showcase){
                        elementsInShowcases = elementsInShowcases.concat(showcase.elements);
                      });
                      elementsInShowcases = _.pluck(elementsInShowcases,'identifier');
                      elementsInShowcases = _.uniq(elementsInShowcases);
                      var elementsIdentifierFromAllElements = _.pluck(elementsDesnormalized,'elementIdentifier');
                      var elementsThatAreInShowcaseAndAllElements = _.intersection(elementsIdentifierFromAllElements,elementsInShowcases);

                      _.each(categories,function(category){
                        category.elements = _.filter(category.elements,function(element){
                          return _.contains(elementsThatAreInShowcaseAndAllElements,element.identifier);
                        });
                      });
                      categories = _.filter(categories,function(category){
                        return category.elements.length != 0;
                      });

                      _.each(sitesDesnormalized,function(site){
                        site.showcases = _.filter(site.showcases,function(showcase){
                          return _.findWhere(showcasesInSites,{showcaseIdentifier:showcase.showcaseIdentifier}) != null;
                        });
                        _.each(site.showcases,function(showcase){
                          showcase.elements = _.filter(showcase.elements,function(element){
                            return _.contains(elementsThatAreInShowcaseAndAllElements,element.identifier);
                          });
                        });
                      });
                      var currenttime = Date.now();
                      console.log((currenttime-startedTime)/1000);


                      res.json({categories:categories, sites:sitesDesnormalized});
                    }
                  });
                }
              });

              //_.each(categories,function(category){
                //category.elements = category.elements.splice(ELEMENTS_IN_CATEGORY);
              //});
            }
          });
        }
      });

    };

    return functions;
};
