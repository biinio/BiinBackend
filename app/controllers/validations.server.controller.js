var moment = require('moment');
var dateFormat = "YYYY-MM-DDTHH:mm:ss";
var utils = require('./utils.server.controller');
var _ = require('underscore');

var BIIN_DEFAULT_IMAGE = {
    domainColor: '170, 171, 171',
    mediaType: '1',
    title1: 'default',
    url: 'https://biinapp.blob.core.windows.net/biinmedia/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/media/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/4e8b2fb3-af89-461d-9c37-2cc667c20653/media/4af24d51-2173-4d41-b651-d82f18f00d1b.jpg',
    vibrantColor: '170, 171, 171',
    vibrantDarkColor: '85,86,86',
    vibrantLightColor: '170, 171, 171'
};

exports.validateGiftInfo = function(giftToValidate) {

    var validatedGift = {};
    validatedGift.identifier = giftToValidate.identifier;
    validatedGift.productIdentifier = giftToValidate.gift.productIdentifier;
    validatedGift.organizationIdentifier = giftToValidate.gift.organizationIdentifier;
    validatedGift.name = giftToValidate.gift.name;
    validatedGift.message = giftToValidate.gift.message;
    validatedGift.status = giftToValidate.status;
    validatedGift.receivedDate = moment.utc(giftToValidate.recievedDate).format(dateFormat) + "Z";
    validatedGift.expirationDate = moment.utc(giftToValidate.gift.endDate).format(dateFormat) + "Z";
    validatedGift.hasExpirationDate = giftToValidate.gift.hasAvailablePeriod ? "1" : "0";
    validatedGift.sites = giftToValidate.gift.sites;
    validatedGift.media = giftToValidate.gift.media;
    validatedGift.primaryColor = giftToValidate.gift.primaryColor ? giftToValidate.gift.primaryColor : "170,171,171";
    validatedGift.secondaryColor = giftToValidate.gift.secondaryColor ? giftToValidate.gift.secondaryColor : "85,86,86";
    return validatedGift;
};



exports.validateSiteInitialInfo = function(site, userData) {
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


    let userShare = _.findWhere(userData.shareObjects, {
        identifier: siteValidated.identifier,
        type: "site"
    });
    //let userCollected = _.findWhere(userData.biinieCollections.sites, {identifier: siteValidated.identifier});
    let userFollowed = _.findWhere(userData.followObjects, {
        identifier: siteValidated.identifier,
        type: "site"
    });
    let userLiked = _.findWhere(userData.likeObjects, {
        identifier: siteValidated.identifier,
        type: "site"
    });

    siteValidated.userShared  = typeof(userShare) !== "undefined" ? "1" : "0";
    siteValidated.userFollowed = typeof(userFollowed) !== "undefined" ? "1" : "0";
    siteValidated.userLiked = typeof(userLiked) !== "undefined" ? "1" : "0";

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

    return siteValidated;
};

exports.validateOrganizationInitialInfo = function(organization) {

    function validateLoyaltyOrganization(loyalty){
        function validateLoyaltyCard(loyaltyCard) {
            let newloyaltyCard = {};
            newloyaltyCard.identifier = loyaltyCard.identifier ? loyaltyCard.identifier : "";
            newloyaltyCard.title = loyaltyCard.title ? loyaltyCard.title : "";
            newloyaltyCard.rule = loyaltyCard.rule ? loyaltyCard.rule : "";
            newloyaltyCard.goal = loyaltyCard.goal ? loyaltyCard.goal : "";
            newloyaltyCard.conditions = loyaltyCard.conditions ? loyaltyCard.conditions : "";
            newloyaltyCard.isCompleted = loyaltyCard.isCompleted ? "1" : "0";
            newloyaltyCard.isBiinieEnrolled = loyaltyCard.isBiinieEnrolled ? "1" : "0";
            newloyaltyCard.isUnavailable = loyaltyCard.isUnavailable ? "1" : "0";
            newloyaltyCard.elementIdentifier = loyaltyCard.elementIdentifier ? loyaltyCard.elementIdentifier : "";
            newloyaltyCard.startDate = loyaltyCard.startDate == "" ? loyaltyCard.startDate : utils.getDate(loyaltyCard.initialDate);
            newloyaltyCard.endDate = loyaltyCard.endDate == "" ? loyaltyCard.endDate : utils.getDate(loyaltyCard.endDate);
            newloyaltyCard.enrolledDate = loyaltyCard.enrolledDate == "" ? loyaltyCard.enrolledDate : utils.getDate(loyaltyCard.enrolledDate);
            newloyaltyCard.slots = loyaltyCard.slots ? loyaltyCard.slots + "" : "0";
            newloyaltyCard.usedSlots = loyaltyCard.usedSlots ? loyaltyCard.usedSlots + "" : "0";
            return newloyaltyCard;
        }

        if( _.isEmpty( loyalty )){
            return {};
        } else {
            let newLoyalty = {};
            if(loyalty.loyaltyCard){
                newLoyalty.loyaltyCard = validateLoyaltyCard(loyalty.loyaltyCard);
            }
            return newLoyalty
        }

    }

    var organizationValidated = {};
    organizationValidated.identifier = organization.identifier ? organization.identifier : "";
    //organizationValidated._id = organization._id ? organization._id : "";
    organizationValidated.media = organization.media && organization.media.length != 0 ? organization.media : [BIIN_DEFAULT_IMAGE];
    //organizationValidated.extraInfo = organization.extraInfo ? organization.extraInfo : "";
    //organizationValidated.description = organization.description ? organization.description : "";
    organizationValidated.brand = organization.brand ? organization.brand : "";
    //organizationValidated.name = organization.name ? organization.name : "";
    organizationValidated.isLoyaltyEnabled = "1";//organization.isLoyaltyEnabled ? organization.isLoyaltyEnabled : "0";
    organizationValidated.loyalty = organization.loyalty ? organization.loyalty : {};
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

    organizationValidated.loyalty = validateLoyaltyOrganization(organizationValidated.loyalty);
    organizationValidated.isLoyaltyEnabled = _.isEmpty(organizationValidated.loyalty) ? "0" : "1";
    


    return organizationValidated;
};

exports.validateElementInitialInfo = function(element, userData) {
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


    let isUserCollect = false;
    for (let j = 0; j < userData.biinieCollections.length && !isUserCollect; j++) {
        var elUserCollect = _.findWhere(userData.biinieCollections[j].elements, {identifier: elementValidated.identifier});
        isUserCollect = elUserCollect != null;
    }

    var userShareElements = _.filter(userData.shareObjects, function (like) {
        return like.type === "element"
    });
    var elUserShared = _.findWhere(userShareElements, {identifier: elementValidated.identifier});
    var isUserShared = elUserShared != null;

    var userLikeElements = _.filter(userData.likeObjects, function (like) {
        return like.type === "element"
    });

    var elUserLike = _.findWhere(userLikeElements, {identifier: elementValidated.identifier});
    var isUserLike = elUserLike != null;

    var elUserViewed = _.findWhere(userData.seenElements, {elementIdentifier: elementValidated.identifier});
    var isUserViewedElement = elUserViewed != null;

    elementValidated.userShared = isUserShared ? "1" : "0";
    elementValidated.userLiked = isUserLike ? "1" : "0";
    elementValidated.userCollected = isUserCollect ? "1" : "0";
    elementValidated.userViewed = isUserViewedElement ? "1" : "0";


    if (!element.hasCallToAction) {
        elementValidated.hasCallToAction = "0";
    } else {
        elementValidated.hasCallToAction = "1";
    }
    elementValidated.callToActionURL = element.callToActionURL ? element.callToActionURL : "";
    elementValidated.callToActionTitle = element.callToActionTitle ? element.callToActionTitle : "";

    return elementValidated;
};

exports.validateShowcaseInitialInfo = function(showcase) {
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
};

exports.validateNoticesInitialInfo = function(notice) {
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
};