var _ = require('underscore');
var utils = require('../utils.server.controller');
var HashTable = require('hashtable');

// Controllers
var cards = require('../mobile/cards.mobile.server.controller');
var validations = require('../validations.server.controller');

//Schemas
var organization            = require('../../models/organization');
var showcase                = require('../../models/showcase');
var mobileUser              = require('../../models/mobileUser');
var mobileSession           = require('../../models/mobileSession');
var client                  = require('../../models/client');
var biin                    = require('../../models/biin');
var categoryModel           = require('../../models/category');
var notice                  = require('../../models/notices');


// Config of priorities of categories
var configPriorities = require('../../../config/priorities/priorities.json');

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
    siteValidated.phoneNumber = siteValidated.phoneNumber.replace(/ /g, "");
    siteValidated.media = site.media && site.media.length != 0 ? site.media : [BIIN_DEFAULT_IMAGE];
    siteValidated.neighbors = site.neighbors ? site.neighbors : [];
    siteValidated.showcases = site.showcases ? site.showcases : [];
    siteValidated.biins = site.biins ? site.biins : [];
    siteValidated.userShared = site.userShared ? site.userShared : "0";
    siteValidated.userFollowed = site.userShared ? site.userFollowed : "0";
    siteValidated.userLiked = site.userShared ? site.userLiked : "0";
    siteValidated.siteSchedule = site.siteSchedule ? site.siteSchedule : "";
    siteValidated.proximity = site.proximity ? site.proximity.toFixed(14) + "" : "999999999999";

    siteValidated.notices = site.notices ? site.notices : [];


    for (var i = 0; i < siteValidated.showcases.length; i++) {
        var showcase = {};
        if (siteValidated.showcases[i].showcaseIdentifier != null)
            showcase.identifier = siteValidated.showcases[i].showcaseIdentifier;
        else if (siteValidated.showcases[i].identifier != null)
            showcase.identifier = siteValidated.showcases[i].identifier;
        else
            showcase.identifier = "";

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
    organizationValidated.hasNPS = organization.hasNPS ? organization.hasNPS : "0";
    organizationValidated.isUsingBrandColors = organization.isUsingBrandColors ? organization.isUsingBrandColors : "0";
    organizationValidated.primaryColor = organization.primaryColor ? organization.primaryColor : "170,171,171";
    organizationValidated.secondaryColor = organization.secondaryColor ? organization.secondaryColor : "85,86,86";

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
    elementValidated.isTaxIncludedInPrice = element.isTaxIncludedInPrice ? element.isTaxIncludedInPrice : "0";
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
    if (!element.hasCallToAction) {
        elementValidated.hasCallToAction = "0";
    } else {
        elementValidated.hasCallToAction = "1";
    }
    elementValidated.callToActionURL = element.callToActionURL ? element.callToActionURL : "";
    elementValidated.callToActionTitle = element.callToActionTitle ? element.callToActionTitle : "";


    return elementValidated;
}

function validateShowcaseInitialInfo(showcase) {
    var showcaseValidated = {};
    showcaseValidated.identifier = showcase.identifier ? showcase.identifier : "";
    showcaseValidated.title = showcase.name ? showcase.name : "";
    showcaseValidated.elements = [];

    for (var i = 0; i < showcase.elements.length; i++) {
        var currentElement = showcase.elements[i];
        var newElement = null;

        if (currentElement.identifier) {
            newElement = {identifier: currentElement.identifier}
        }
        if (currentElement.elementIdentifier) {
            newElement = {identifier: currentElement.elementIdentifier}
        }
        if (newElement) {
            showcaseValidated.elements.push(newElement);
        }
    }
    return showcaseValidated;
}

function validateNoticesInitialInfo(notice) {
    var noticeValidated = {};
    noticeValidated.identifier = notice.identifier ? notice.identifier : "";
    noticeValidated.elementIdentifier = notice.elementIdentifier ? notice.elementIdentifier : "";
    noticeValidated.name = notice.name ? notice.name : "";
    noticeValidated.message = notice.message ? notice.message : "";
    noticeValidated.onSunday = notice.onSunday ? notice.onSunday : "0";
    noticeValidated.onMonday = notice.onMonday ? notice.onMonday : "0";
    noticeValidated.onTuesday = notice.onTuesday ? notice.onTuesday : "0";
    noticeValidated.onWednesday = notice.onWednesday ? notice.onWednesday : "0";
    noticeValidated.onThursday = notice.onThursday ? notice.onThursday : "0";
    noticeValidated.onFriday = notice.onFriday ? notice.onFriday : "0";
    noticeValidated.onSaturday = notice.onSaturday ? notice.onSaturday : "0";

    noticeValidated.startTime = notice.startTime ? notice.startTime : "0";
    noticeValidated.endTime = notice.endTime ? notice.endTime : "24";
    noticeValidated.isActive = notice.isActive ? notice.isActive : "0";
    noticeValidated.isActive = notice.isActive == "1" ? "1" : "0";


    return noticeValidated;
}


exports.getNextElementInShowcase = function (req, res) {
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
        if (mobileUserData) {
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
                });

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
        } else {
            res.json({data: {"elements": []}, "status": "0", "result": "1"});
        }
    });

};

exports.getNextElementsInCategory = function (req, res) {
    var userIdentifier = req.params["identifier"];
    var categoryId = req.params["idCategory"];
    var ELEMENTS_IN_CATEGORY = process.env.ELEMENTS_IN_CATEGORY || 7;
    var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
    var response = {};

    response.sites = [];
    response.organizations = [];
    response.elements = [];
    response.showcases = [];
    response.notices = [];

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
        if (data) {
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
                            organization.find({
                                'sites.identifier': {$in: sitesInUserCellphone},
                                isDeleted: false,
                                isPublished: true
                            }, {
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

                                    for (i = 0; i < sitesDesnormalized.length; i++) {
                                        for (j = 0; j < sitesDesnormalized[i].showcases.length; j++) {
                                            sitesDesnormalized[i].showcases[j].identifier = sitesDesnormalized[i].showcases[j].showcaseIdentifier;
                                            delete sitesDesnormalized[i].showcases[j].showcaseIdentifier;

                                            var showcaseData = _.find(showcaseDataFromSitesSent, function (showcase) {
                                                return showcase.identifier == sitesDesnormalized[i].showcases[j].identifier;
                                            });
                                            //sitesDesnormalized[i].showcases[j].title = showcaseData.name;
                                            //sitesDesnormalized[i].showcases[j].subTitle = showcaseData.description;
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
                                                sitesDesnormalized[i].showcases[j].elements[k].isHighlight = elementData.isHighlight;
                                            }

                                            sitesDesnormalized[i].showcases[j].elements = _.filter(sitesDesnormalized[i].showcases[j].elements, function (element) {
                                                return element.isReady == 1 && element.isHighlight == "1";
                                            });


                                            var elementsToConcat = sitesDesnormalized[i].showcases[j].elements;
                                            _.each(elementsToConcat, function (element) {
                                                element.showcaseIdentifier = sitesDesnormalized[i].showcases[j].identifier;
                                                element.siteIdentifier = sitesDesnormalized[i].identifier;
                                            });

                                            if (sitesDesnormalized[i].showcases[j].elements.length == 0) {
                                                sitesDesnormalized[i].showcases.splice(j, 1);
                                                j--;
                                            } else {
                                                elementsInShowcase = elementsInShowcase.concat(sitesDesnormalized[i].showcases[j].elements);
                                            }
                                        }
                                    }

                                    // Obtain an array with the element's identifier and convert it into a unique list
                                    var uniqueElementsIdentifierFromShowcase = _.uniq(_.pluck(elementsInShowcase, 'identifier'));

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
                                        var elementData = _.findWhere(elementsDesnormalized, {
                                            'elementIdentifier': availableElementsToSent[i],
                                            'isReady': 1
                                        });
                                        var elementExtraData = _.findWhere(elementsInShowcase, {
                                            'identifier': availableElementsToSent[i]
                                        });
                                        if (elementData && elementExtraData) {
                                            for (j = 0; j < elementData.categories.length; j++) {
                                                if (elementData.categories[j].identifier == categoryId) {
                                                    elementsWithinCategory.push({
                                                        identifier: elementData.elementIdentifier,
                                                        siteIdentifier: elementExtraData.siteIdentifier,
                                                        showcaseIdentifier: elementExtraData.showcaseIdentifier
                                                    });
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    //if the elements are too few to send the next batch, will try to fill
                                    //it with new info from sites that aren't from  site sent to the user
                                    if (elementsWithinCategory.length < ELEMENTS_IN_CATEGORY) {

                                        // Obtaing _id for the nearest Showcase and adding into the group id
                                        var elementsForCategory = elementsWithinCategory;


                                        /*var elementsForCategory = [];
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
                                         }*/

                                        var amountOfExtraElementsNeeded = ELEMENTS_IN_CATEGORY - elementsWithinCategory.length;

                                        var sitesHashTable = new HashTable();
                                        var elementsHashTable = new HashTable();
                                        var organizationHashTable = new HashTable();
                                        var showcasesHashTable = new HashTable();

                                        //Get extra site informmation
                                        organization.find({
                                            'sites.identifier': {$nin: sitesInUserCellphone},
                                            isDeleted: false,
                                            isPublished: true
                                        }, {
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
                                            elementsDesnormalized = [];

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

                                            for (i = 0; i < elementsDesnormalized.length; i++) {
                                                var currentElement = elementsDesnormalized[i];
                                                elementsHashTable.put(currentElement.elementIdentifier, currentElement);
                                            }
                                            for (i = 0; i < sitesDesnormalized.length; i++) {
                                                var currentSite = sitesDesnormalized[i];
                                                sitesHashTable.put(currentSite.site.identifier, currentSite.site);
                                                organizationHashTable.put(currentSite.organization.identifier, currentSite.organization);
                                            }

                                            for (i = 0; i < sitesInUserCellphone.length; i++) {
                                                sitesHashTable.remove(sitesInUserCellphone);
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
                                                    "elements.elementIdentifier": 1,
                                                    "isReady": 1
                                                }).lean().exec(function (showcaseError, showcaseDataFromSitesToSent) {

                                                for (var i = 0; i < showcaseDataFromSitesToSent.length; i++) {
                                                    var currentShowcase = showcaseDataFromSitesToSent[i];
                                                    showcasesHashTable.put(currentShowcase.identifier, currentShowcase);
                                                }


                                                //TODO:ADD showcase data

                                                for (var i = 0; i < sortByProximity.length; i++) {
                                                    for (var j = 0; j < sortByProximity[i].site.showcases.length; j++) {
                                                        sortByProximity[i].site.showcases[j].identifier = sortByProximity[i].site.showcases[j].showcaseIdentifier;
                                                        delete sortByProximity[i].site.showcases[j].showcaseIdentifier;

                                                        var showcaseData = _.find(showcaseDataFromSitesToSent, function (showcase) {
                                                            return showcase.identifier == sortByProximity[i].site.showcases[j].identifier;
                                                        });
                                                        sortByProximity[i].site.showcases[j].isReady = showcaseData.isReady;
                                                    }
                                                    sortByProximity[i].site.showcases = _.filter(sortByProximity[i].site.showcases, function (showcase) {
                                                        return showcase.isReady == 1;
                                                    });
                                                }


                                                for (i = 0; i < sortByProximity.length; i++) {
                                                    for (j = 0; j < sortByProximity[i].site.showcases.length; j++) {
                                                        for (var k = 0; k < sortByProximity[i].site.showcases[j].elements.length; k++) {
                                                            elementData = _.findWhere(elementsDesnormalized, {elementIdentifier: sortByProximity[i].site.showcases[j].elements[k].identifier});
                                                            sortByProximity[i].site.showcases[j].elements[k].isReady = elementData.isReady;
                                                            sortByProximity[i].site.showcases[j].elements[k].isHighlight = elementData.isHighlight;
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
                                                            //sortByProximity[i].site.showcases[j].elements_quantity = sortByProximity[i].site.showcases[j].elements.length + "";
                                                            //sortByProximity[i].site.showcases[j].elements = sortByProximity[i].site.showcases[j].elements.splice(0, LIMIT_ELEMENTS_IN_SHOWCASE);
                                                        }
                                                    }
                                                }

                                                var elementsInShowcase = [];
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
                                                            element.showcaseIdentifier = sortByProximity[i].site.showcases[j].identifier;
                                                            element.siteIdentifier = sortByProximity[i].site.identifier;
                                                            element.orgElements = sortByProximity[i].elements;
                                                            elementsWithSiteRef.push(element);
                                                        }
                                                    }
                                                }

                                                var elementsThatAreHightlights = _.filter(elementsWithSiteRef, function (element) {
                                                    return element.isHighlight == "1";
                                                });

                                                var sitesIdToSend = [];
                                                var elementsThatContainsCategory = [];
                                                for (i = 0; i < elementsThatAreHightlights.length; i++) {
                                                    var element = _.find(elementsThatAreHightlights[i].orgElements, function (element) {
                                                        return element.elementIdentifier == elementsThatAreHightlights[i].identifier;
                                                    });
                                                    if (element) {
                                                        let category = _.find(element.categories, function (category) {
                                                            return category.identifier == categoryId;
                                                        });
                                                        if (category) {
                                                            elementsToAddInCategories++;
                                                            sitesIdToSend.push(elementsWithSiteRef[i].siteIdentifier);
                                                            element.showcaseIdentifier = elementsWithSiteRef[i].showcaseIdentifier;
                                                            element.siteIdentifier = elementsWithSiteRef[i].siteIdentifier;
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
                                                    if (sortByProximity[i].site.showcases) {
                                                        showcasesToFind = showcasesToFind.concat(sortByProximity[i].site.showcases);
                                                        for (var j = 0; j < sortByProximity[i].site.showcases.length; j++) {
                                                            var elementsToConcat = sortByProximity[i].site.showcases[j].elements;
                                                            elementsToSend = elementsToSend.concat(elementsToConcat);
                                                            elementsData = elementsData.concat(sortByProximity[i].elements);
                                                        }
                                                    }
                                                }

                                                for (i = 0; i < showcasesToFind.length; i++) {
                                                    var currentShowcase = showcasesToFind[i];
                                                    var showcaseData = showcasesHashTable.get(currentShowcase.identifier);
                                                    if (showcaseData) {
                                                        currentShowcase.name = showcaseData.name;
                                                        showcasesToFind[i] = currentShowcase;
                                                    }
                                                }

                                                response.showcases = showcasesToFind;

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
                                                    element.showcaseIdentifier = elementsThatContainsCategory[i].showcaseIdentifier;
                                                    element.identifier = elementsThatContainsCategory[i].elementIdentifier;
                                                    element.siteIdentifier = elementsThatContainsCategory[i].siteIdentifier;
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

                                                for (i = 0; i < response.elements.length; i++) {
                                                    response.elements[i] = validateElementInitialInfo(response.elements[i]);
                                                    elementsSent.push({identifier: response.elements[i].identifier});
                                                }

                                                for (i = 0; i < response.showcases.length; i++) {
                                                    var currentValidatedShowcae = validateShowcaseInitialInfo(response.showcases[i]);
                                                    response.showcases[i] = currentValidatedShowcae;
                                                }

                                                response.elementsForCategory = elementsForCategory.concat(elementsWithCategory);


                                                //ADDING NOTICES INFORMATION

                                                var noticesToFind = [];
                                                var noticesValidated = [];

                                                for (i = 0; i < response.sites.length; i++) {
                                                    var site = response.sites[i];
                                                    noticesToFind = noticesToFind.concat(response.sites[i].notices);
                                                }

                                                noticesToFind = _.uniq(noticesToFind);
                                                //TODO: CHECK IS READY
                                                notice.find({
                                                    "identifier": {$in: noticesToFind},
                                                    isDeleted: false
                                                }, {}, function (err, notices) {
                                                    if (err) {

                                                    } else {
                                                        var noticesIdentifierFound = _.pluck(notices, "identifier");
                                                        var noticesNotFound = _.difference(noticesToFind, noticesIdentifierFound);
                                                        for (i = 0; i < notices.length; i++) {
                                                            var notice = notices[i];
                                                            noticesValidated.push(validateNoticesInitialInfo(notice));
                                                        }

                                                        for (i = 0; i < response.sites.length; i++) {
                                                            var site = response.sites[i];
                                                            site.notices = _.difference(site.notices, noticesNotFound);
                                                            response.sites[i] = site;
                                                        }

                                                        response.notices = noticesValidated;


                                                        res.json({data: response, status: "0", result: "1"});
                                                        saveInfoIntoUserMobileSession(userIdentifier, response.sites, response.elements, {
                                                            'identifier': categoryId,
                                                            'elements': elementsForCategory
                                                        }, response.organization);
                                                    }
                                                });


                                            });
                                        });

                                    } else {
                                        // Otherwise will be sent just only the elements
                                        var elementsToSend = elementsWithinCategory.splice(0, ELEMENTS_IN_CATEGORY);

                                        // Obtaining _id for the nearest Showcase and adding into the group id
                                        /*var elementsForCategory = [];
                                         for (i = 0; i < elementsToSend.length; i++) {
                                         for (j = 0; j < elementsInShowcase.length; j++) {
                                         if (elementsToSend[i].elementIdentifier == elementsInShowcase[j].identifier) {
                                         elementsForCategory.push({
                                         siteIdentifier: elementsInShowcase[j].showcase_id,
                                         showcaseIdentifier: elementsInShowcase[j]._id,
                                         identifier: elementsToSend[i].elementIdentifier
                                         });
                                         response.elements.push(elementsToSend[i]);
                                         break;
                                         }
                                         }
                                         }*/

                                        response.elementsForCategory = elementsToSend;

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
                                        //ADDING NOTICES INFORMATION

                                        var noticesToFind = [];
                                        var noticesValidated = [];

                                        for (i = 0; i < response.sites.length; i++) {
                                            var site = response.sites[i];
                                            noticesToFind = noticesToFind.concat(response.sites[i].notices);
                                        }

                                        noticesToFind = _.uniq(noticesToFind);
                                        //TODO: CHECK IS READY
                                        notice.find({
                                            "identifier": {$in: noticesToFind},
                                            isDeleted: false
                                        }, {}, function (err, notices) {
                                            if (err) {

                                            } else {
                                                var noticesIdentifierFound = _.pluck(notices, "identifier");
                                                var noticesNotFound = _.difference(noticesToFind, noticesIdentifierFound);
                                                for (i = 0; i < notices.length; i++) {
                                                    var notice = notices[i];
                                                    noticesValidated.push(validateNoticesInitialInfo(notice));
                                                }

                                                for (i = 0; i < response.sites.length; i++) {
                                                    var site = response.sites[i];
                                                    site.notices = _.difference(site.notices, noticesNotFound);
                                                    response.sites[i] = site;
                                                }

                                                response.notices = noticesValidated;


                                                res.json({data: response, status: "0", result: "1"});
                                                saveInfoIntoUserMobileSession(userIdentifier, response.sites, response.elements, {
                                                    'identifier': categoryId,
                                                    'elements': elementsForCategory
                                                }, response.organizations);
                                            }
                                        });


                                    }
                                });
                            });
                        });
                    } else {
                        res.json({data: {}, "status": "2", "result": "0"});
                    }
                });
            });
        } else {
            res.json({data: response, "status": "0", "result": "1"});
        }
    });
};

exports.getNextSites = function (req, res) {
    var userIdentifier = req.params["identifier"];
    var MAX_SITES = process.env.SITES_INITIAL_DATA || 10;
    var LIMIT_ELEMENTS_IN_SHOWCASE = process.env.LIMIT_ELEMENTS_IN_SHOWCASE || 6;
    var DEFAULT_COLLECTION = 0;
    var response = {};
    response.sites = [];
    response.organizations = [];
    response.showcases = [];

    var showcases = [];
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
        if (userData) {
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
                        organization.find({
                            'sites.identifier': {$nin: sitesInUserCellphone},
                            isDeleted: false,
                            isPublished: true
                        }, {
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

                            for (i = 0; i < response.sites.length; i++) {

                                var userShare = _.findWhere(userData.shareObjects, {
                                    identifier: response.sites[i].identifier,
                                    type: "site"
                                });
                                var userCollected = _.findWhere(userData.biinieCollections.sites, {identifier: response.sites[i].identifier});
                                var userFollowed = _.findWhere(userData.followObjects, {
                                    identifier: response.sites[i].identifier,
                                    type: "site"
                                });
                                var userLiked = _.findWhere(userData.likeObjects, {
                                    identifier: response.sites[i].identifier,
                                    type: "site"
                                });

                                response.sites[i].userShared = typeof(userShare) !== "undefined" ? "1" : "0";
                                response.sites[i].userFollowed = typeof(userFollowed) !== "undefined" ? "1" : "0";
                                response.sites[i].userCollected = typeof(userCollected) !== "undefined" ? "1" : "0";
                                response.sites[i].userLiked = typeof(userLiked) !== "undefined" ? "1" : "0";
                            }

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

                                    showcases = [];
                                    for (i = 0; i < response.sites.length; i++) {
                                        for (j = 0; j < response.sites[i].showcases.length; j++) {
                                            response.sites[i].showcases[j].identifier = response.sites[i].showcases[j].showcaseIdentifier;
                                            delete response.sites[i].showcases[j].showcaseIdentifier;

                                            var showcaseData = _.find(showcasesData, function (showcase) {
                                                return showcase.identifier == response.sites[i].showcases[j].identifier;
                                            });
                                            response.sites[i].showcases[j].title = showcaseData.name;
                                            response.sites[i].showcases[j].name = showcaseData.name;
                                            response.sites[i].showcases[j].subTitle = showcaseData.description;
                                            response.sites[i].showcases[j].isReady = showcaseData.isReady;
                                        }
                                        response.sites[i].showcases = _.filter(response.sites[i].showcases, function (showcase) {
                                            return showcase.isReady == 1;
                                        });

                                        showcases = showcases.concat(response.sites[i].showcases);


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


                                    for (i = 0; i < showcases.length; i++) {
                                        var currentShowcase = showcases[i];
                                        currentShowcase.elements = _.filter(currentShowcase.elements, function (element) {
                                            return uniqueElementsShowcase.indexOf(element.identifier) > -1;
                                        });

                                    }

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
                                    for (i = 0; i < showcases.length; i++) {
                                        var currentShowcase = validateShowcaseInitialInfo(showcases[i]);
                                        showcases[i] = currentShowcase;

                                    }

                                    response.organizations = orgData;
                                    response.elements = elementsfiltered;
                                    response.showcases = showcases;

                                    //ADDING NOTICES INFORMATION

                                    var noticesToFind = [];
                                    var noticesValidated = [];

                                    for (i = 0; i < response.sites.length; i++) {
                                        var site = response.sites[i];
                                        noticesToFind = noticesToFind.concat(response.sites[i].notices);
                                    }

                                    noticesToFind = _.uniq(noticesToFind);
                                    //TODO: CHECK IS READY
                                    notice.find({
                                        "identifier": {$in: noticesToFind},
                                        isDeleted: false
                                    }, {}, function (err, notices) {
                                        if (err) {

                                        } else {
                                            var noticesIdentifierFound = _.pluck(notices, "identifier");
                                            var noticesNotFound = _.difference(noticesToFind, noticesIdentifierFound);
                                            for (i = 0; i < notices.length; i++) {
                                                var notice = notices[i];
                                                noticesValidated.push(validateNoticesInitialInfo(notice));
                                            }

                                            for (i = 0; i < response.sites.length; i++) {
                                                var site = response.sites[i];
                                                site.notices = _.difference(site.notices, noticesNotFound);
                                                response.sites[i] = site;
                                            }

                                            response.notices = noticesValidated;


                                            res.json({data: response, status: "0", result: "1"});
                                            saveInfoIntoUserMobileSession(userIdentifier, response.sites, response.elements, null, response.organization);
                                        }
                                    });
                                });
                        });

                    } else {
                        res.json({data: {}, "status": "2", "result": "0"});
                    }
                });
            });
        } else {
            res.json({data: {}, "status": "3", "result": "0"});
        }
    });
};

exports.getCollections = function (req, res) {
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
        if (data) {
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
                    organization.find({
                        'elements.elementIdentifier': {$in: elementsUserCollected},
                        isDeleted: false,
                        isPublished: true
                    }, {
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
        }
        else {
            res.json({data: response, "status": "0", "result": "1"});
        }
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

exports.getInitalDataFullCategories = function (req, res) {
    var userIdentifier = req.params.biinieId;
    var userLat = eval(req.params.latitude);
    var userLng = eval(req.params.longitude);

    var LIMIT_HIGHLIGHTS_TO_SENT = process.env.LIMIT_HIGHLIGHTS_TO_SENT || 6;


    var organizations = [];
    var elements = [];
    var sites = [];
    var notices = [];
    var showcases = [];
    var categories = [];
    var nearbySites = [];


    var organizationsHash = new HashTable();
    var elementsHash = new HashTable();
    var sitesHash = new HashTable();
    var showcasesHash = new HashTable();
    var noticesHash = new HashTable();

    var userBiinieData = null;

    var favorites = {};
    favorites.sites = [];
    favorites.elements = [];

    var categoriesInDB = [];

    var fillSitesHash = function () {
        return new Promise(function (resolve, reject) {
            organization.find({isDeleted: false, isPublished: true}, {identifier: 1, sites: 1})
                .lean()
                .exec(function (err, orgsData) {
                    if (err) {
                        reject(err)
                    } else {
                        orgsData.forEach(function (organizationData) {
                            organizationData.sites.forEach(function (site) {
                                if (!site.isDeleted && site.isReady == 1) {
                                    site.organizationIdentifier = organizationData.identifier;
                                    sitesHash.put(site.identifier, site);
                                }
                            });
                        });
                        resolve();
                    }
                });
        });
    };

    var fillOrganizationHash = function () {
        return new Promise(function (resolve, reject) {
            organization.find({isDeleted: false, isPublished: true}, { elements: 0, sites: 0})
                .lean()
                .exec(function (err, orgsData) {
                    if (err) {
                        reject(err)
                    } else {
                        orgsData.forEach(function (organizationData) {
                            organizationsHash.put(organizationData.identifier, organizationData);
                        });
                        resolve();
                    }
                });
        });
    };

    var fillElementsHash = function () {
        return new Promise(function (resolve, reject) {
            organization.find({isDeleted: false, isPublished: true}, {elements: 1})
                .lean()
                .exec(function (err, orgsData) {
                    if (err) {
                        reject(err)
                    } else {
                        orgsData.forEach(function (organizationData) {
                            organizationData.elements.forEach(function (element) {
                                if (!element.isDeleted && element.isReady == 1)
                                    elementsHash.put(element.elementIdentifier, element);
                            });
                        });
                        resolve();
                    }
                });
        });
    };

    var fillShowcasesHash = function () {
        return new Promise(function (resolve, reject) {
            showcase.find({"isReady": 1, isDeleted: false},
                {}).lean().exec(
                function (err, showcases) {
                    if (err)
                        reject(err);
                    else {
                        showcases.forEach(function (showcaseData) {
                            showcasesHash.put(showcaseData.identifier, showcaseData);
                        });
                        resolve();
                    }
                });
        });

    };

    var fillNoticesHash = function () {
        return new Promise(function (resolve, reject) {
            notice.find({isActive: true, isDeleted: false},
                {}).lean().exec(
                function (err, notices) {
                    if (err)
                        reject(err);
                    else {
                        notices.forEach(function (noticeData) {
                            noticesHash.put(noticeData.identifier, noticeData);
                        });
                        resolve();
                    }
                });
        });

    };

    var getUserInfo = function () {
        return new Promise(function (resolve, reject) {
            mobileUser.findOne({'identifier': userIdentifier}, {
                'gender': 1,
                'showcaseNotified': 1,
                'biinieCollections': 1,
                'loyalty': 1,
                "likeObjects": 1,
                "followObjects": 1,
                "biinieCollect": 1,
                "shareObjects": 1
            }).lean().exec(function (err, mobileUserData) {
                if (err)
                    reject(err);
                if (mobileUserData) {
                    userBiinieData = mobileUserData;
                    resolve();
                } else {
                    reject("No biinie found");
                }
            });

        });
    };

    var getCategoriesIdentifier = function(){
        return new Promise(function (resolve, reject) {
            categoryModel.find({},{identifier:1}).lean().exec(function(err, categoriesFound){
                if(err)
                    reject();
                else {
                    categoriesInDB = categoriesFound;
                    resolve()
                }

            })
        });
    };

    var fillElementRelationalInfo = function( element ){
        var elementIdentifier = element.elementIdentifier;
        var siteIdentifier = null;
        var showcaseIdentifier = null;

        let sitesFiltered = _.where(sites,{organizationIdentifier:element.organizationIdentifier});

        sitesFiltered = _.sortBy(sitesFiltered,"proximity");

        for (var i = 0; i < sitesFiltered.length && siteIdentifier == null; i++) {
            var site = sitesFiltered[i];
            for (var j = 0; j < site.showcases.length && showcaseIdentifier == null; j++) {
                var showcase = showcasesHash.get(site.showcases[j].showcaseIdentifier);
                if(showcase){
                    let hasTheElement = _.findWhere(showcase.elements,{elementIdentifier:elementIdentifier}) != null;
                    if(hasTheElement){
                        showcaseIdentifier = showcase.identifier;
                        siteIdentifier = site.identifier;
                    }
                }
            }
        }

        var relationalObject = {};
        relationalObject.identifier = elementIdentifier;
        relationalObject.siteIdentifier = siteIdentifier;
        relationalObject.showcaseIdentifier = showcaseIdentifier;
        relationalObject.categories = element.categories;
        return relationalObject;

    };

    var fillFavoritesSites = function(){
        return new Promise(function (resolve) {
            let sitesLiked = [];
            sitesHash.forEach(function(key){
                let userLiked = _.findWhere(userBiinieData.likeObjects, {
                    identifier: key,
                    type: "site"
                });
                if(userLiked){
                    sitesLiked.push({identifier:key});
                }
            });
            favorites.sites = sitesLiked;
            resolve();
        });
    };

    var fillFavoritesElements = function(){
        return new Promise(function (resolve) {

            let userLikeElements = _.filter(userBiinieData.likeObjects, function (like) {
                return like.type === "element"
            });

            let elementsLiked = [];

            elementsHash.forEach(function(key,value){
                var elUserLike = _.findWhere(userLikeElements, {identifier: key});
                if( elUserLike != null ){
                    elementsLiked.push(value);
                }
            });

            let relationalElements =[];

            elementsLiked.forEach(function (element) {
                relationalElements.push(fillElementRelationalInfo(element));
            });

            favorites.elements = _.map(relationalElements, function(element){
                let mappedElement = {};
                mappedElement.identifier = element.identifier;
                mappedElement.siteIdentifier = element.siteIdentifier;
                mappedElement.showcaseIdentifier = element.showcaseIdentifier;
                return mappedElement;
            });

            resolve();
        });
    };

    var fillArrays = function(){
        return new Promise(function (resolve) {
            organizationsHash.forEach(function (key, organization) {
                organizations.push(organization);
            });
            sitesHash.forEach(function (key, site) {
                site.proximity = utils.getProximity(userLat, userLng, site.lat, site.lng);
                sites.push(site);
            });
            elementsHash.forEach(function (key, element) {
                elements.push(element);
            });
            showcasesHash.forEach(function (key, showcase) {
                showcases.push(showcase);
            });
            noticesHash.forEach(function (key, notice) {
                notices.push(notice);
            });

            resolve();
        });
    };

    var assignCards = function(cards){
        return new Promise(function (resolve) {
            cards.forEach(function(cardsByOrg){
                let org = organizationsHash.get(cardsByOrg.organizationIdentifier);
                if(org){
                    org.loyalty = {};
                    org.loyalty.loyaltyCard = cardsByOrg.loyaltyCard;
                    organizationsHash.put(cardsByOrg.organizationIdentifier,org);
                }
            });
            resolve();
        });
    };

    var onError = function ( err ) {
        console.log(err);

        var response = {};
        response.sites = [];
        response.organizations = [];
        response.elements = [];
        response.highlights = [];
        response.categories = [];
        response.favorites = [];
        response.notices = [];
        res.json({data: response, status: "0", result: "1"});

    };

    fillOrganizationHash().then(function () {
        return fillSitesHash();
    }, onError).then(function () {
        return fillElementsHash();
    }, onError).then(function () {
        return fillShowcasesHash();
    }, onError).then(function () {
        return fillNoticesHash();
    }, onError).then(function () {
        return getUserInfo();
    }, onError).then(function () {
        return getCategoriesIdentifier();
    }, onError).then(function () {
        return cards.getUserCards(userIdentifier);
    }, onError).then(function (biinieCards) {
        return assignCards(biinieCards);
    }, onError).then(function () {
        return fillFavoritesSites();
    }, onError).then(function () {
        return fillArrays();
    }, onError).then(function () {
        return fillFavoritesElements();
    }, onError).then(function () {

        //Setting closest sites from the biinie
        _.pluck(_.sortBy(sites,"proximity"),"identifier").forEach(function(siteIdentifier){
            nearbySites.push({identifier:siteIdentifier});
        });


        //Setting Highlights
        let highlightsElements  = _.where(elements,{"isHighlight":"1"});
        let relationalHighLights = [];
        highlightsElements.forEach(function (highlight) {
            relationalHighLights.push(fillElementRelationalInfo(highlight));
        });

        relationalHighLights = _.filter(relationalHighLights,function (relationHighlight) {
            return relationHighlight.siteIdentifier && relationHighlight.showcaseIdentifier;
        });


        //Setting Categories
        for (var i = 0; i < categoriesInDB.length; i++) {
            var categoryIdentifier = categoriesInDB[i].identifier;
            let elementsInCategory =_.filter(relationalHighLights, function (relationHighlight) {
                return _.findWhere(relationHighlight.categories,{identifier:categoryIdentifier})
            });
            categories.push({
                identifier : categoryIdentifier,
                elements: elementsInCategory
            })
        }

        //Filtering categories that are empty
        categories = _.filter(categories,function(category){
            return category.elements.length > 0;
        });

        categories.forEach(function(category){
            category.elements = _.map(category.elements, function(element){
                let mappedElement = {};
                mappedElement.identifier = element.identifier;
                mappedElement.siteIdentifier = element.siteIdentifier;
                mappedElement.showcaseIdentifier = element.showcaseIdentifier;
                return mappedElement;
            });
        });


        //Mapping Highlights
        relationalHighLights = _.map(relationalHighLights, function(element){
            let mappedElement = {};
            mappedElement.identifier = element.identifier;
            mappedElement.siteIdentifier = element.siteIdentifier;
            mappedElement.showcaseIdentifier = element.showcaseIdentifier;
            return mappedElement;
        });

        relationalHighLights = relationalHighLights.splice(0,LIMIT_HIGHLIGHTS_TO_SENT);


        //Validations
        for (let i = 0; i < organizations.length; i++) {
            organizations[i] = validations.validateOrganizationInitialInfo(organizations[i]);
        }

        for (let i = 0; i < sites.length; i++) {
            sites[i] = validations.validateSiteInitialInfo(sites[i], userBiinieData);
        }

        for (let i = 0; i < showcases.length; i++) {
            showcases[i] = validations.validateShowcaseInitialInfo(showcases[i],userBiinieData);
        }

        for (let i = 0; i < elements.length; i++) {
            elements[i] = validations.validateElementInitialInfo(elements[i],userBiinieData);
        }

        for (let i = 0; i < notices.length; i++) {
            notices[i] = validations.validateNoticesInitialInfo(notices[i],userBiinieData);
        }

        //REMOVING ELEMENTS FROM SHOWCASE THAT ARE INVALID AND THEY ARE NOT IN THE HASHTABLE
        for (let i = 0; i < showcases.length; i++) {
            var showcase = showcases[i];
            showcase.elements = _.filter(showcase.elements, function(element){
                return elementsHash.has(element.identifier);
            });
        }

        let deletedShowcases = [];
        showcases = _.filter(showcases,function (showcase) {
            if (showcase.length <= 0) {
                deletedShowcases.push(showcase.identifier);
                return false;
            }
            return true;
        });

        for (let i = 0; i < deletedShowcases.length; i++) {
            let showcaseId = deletedShowcases[i];
            showcasesHash.remove(showcaseId);
        }

        //REMOVING SHOWCASES FROM SITE THAT ARE INVALID AND THEY ARE NOT IN THE HASHTABLE

        for (let i = 0; i < sites.length; i++) {
            var site = sites[i];
            site.showcases = _.filter(site.showcases, function(showcase){
                return showcasesHash.has(showcase.identifier);
            });
        }


        res.json({data:{
            organizations: organizations,
            sites: sites,
            nearbySites : nearbySites,
            elements: elements,
            showcases: showcases,
            notices: notices,
            highlights : relationalHighLights,
            categories : categories,
            favorites : favorites
        }, status: "0", result: "1"});
    }, onError).catch(function (err) {
        console.log(err);
        throw err;
    });
};

exports.getTermsOfService = function (req, res) {
    res.json({data: configPrivacy, status: "0", result: "1"});
};

   
