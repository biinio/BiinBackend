/**
 * Created by Ivan on 7/28/16.
 */
var moment = require('moment');
var dateFormat = "YYYY-MM-DDTHH:mm:ss";
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