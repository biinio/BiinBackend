var _ = require('underscore');

var gifts = require('../../models/gifts');
var giftsPerBiinie = require('../../models/giftsPerBiinie');
var organization = require('../../models/organization');
var biinies = require('../../models/mobileUser');

var giftsStatus = require('../enums/giftstatusenum');

var utils = require('../utils.server.controller');
var notificationsManager = require('../notifications.server.controller');
var validations = require('../validations.server.controller');

exports.getBiiniesGifts = function (biinieIdentifier) {
    return new Promise(function (resolve, reject) {
        giftsPerBiinie.find({
            "biinieIdentifier": biinieIdentifier,
            "gift.productIdentifier": {$ne: ""},
            "gift.sites": {$ne: []},
            "status": {$ne: giftsStatus.REFUSED}
        }, {}).lean().exec(function (err, giftsFound) {
            if (err) {
                reject(err);
            } else {
                if (giftsFound.length > 0) {
                    var elementsToFind = _.map(giftsFound, function (gift) {
                        return gift.gift.productIdentifier;
                    });
                    elementsToFind = _.uniq(elementsToFind);

                    organization.find({"elements.elementIdentifier": {$in: elementsToFind}}, {
                        identifier: 1,
                        elements: 1,
                        primaryColor: 1,
                        secondaryColor: 1
                    }, function (err, organizations) {
                        if (err) {
                            reject(err);
                        } else {
                            var elements = [];
                            var org = {};
                            for (var i = 0; i < organizations.length; i++) {
                                org = organizations[i];
                                elements = elements.concat(org.elements);
                            }
                            for (i = 0; i < giftsFound.length; i++) {
                                var gift = giftsFound[i];
                                var element = _.findWhere(elements, {elementIdentifier: gift.gift.productIdentifier});
                                org = _.findWhere(organizations, {identifier: gift.gift.organizationIdentifier});
                                if (element && org) {
                                    gift.gift.media = element.media;
                                    gift.gift.primaryColor = org.primaryColor;
                                    gift.gift.secondaryColor = org.secondaryColor;
                                } else {
                                    giftsFound = giftsFound.splice(i, 1);
                                    i--;
                                }
                            }
                            resolve(giftsFound);
                        }
                    })


                } else {
                    resolve(giftsFound);
                }
            }
        });
    });
};

/**
 *  Gifts calls for mobile
 */

exports.refuseGift = function (req, res) {
    var biinieGiftIdentifier = req.body.model.giftIdentifier;
    giftsPerBiinie.findOne({identifier: biinieGiftIdentifier}, {}, function (err, biinieGift) {
        if (err) {
            res.json({status: "1", result: "0", data: {}});
        } else {
            biinieGift.status = giftsStatus.REFUSED;
            biinieGift.save(function (err) {
                if (err) {
                    res.json({status: "1", result: "0", data: {}});
                } else {
                    res.json({status: "0", result: "1", data: {}});
                }
            })
        }
    });
};

exports.shareGift = function (req, res) {
    var model = req.body.model;
    var biinieIdentifier = req.params.identifier;
    var giftIdentifier = model.giftIdentifier;
    var to = model.biinieReciever;
    giftsPerBiinie.findOne({identifier: giftIdentifier}, {}, function (err, biinieGift) {
        if (err) {
            res.json({status: "1", result: "0", data: {}});
        } else {
            biinieGift.status = giftsStatus.SHARED;
            biinies.findOne({facebookId:to},{identifier:"1"},function(err, biinnie){
                if(err){
                    res.json({status: "2", result: "0", data: {}});
                } else {
                    biinieGift.biinieIdentifier = biinnie.identifier;
                    //SEND NOTIFICATION TO THE NEW BIINIE
                    biinieGift.save(function (err) {
                        if (err) {
                            res.json({status: "3", result: "0", data: {}});
                        } else if(biinnie){

                            exports.getBiiniesGifts(biinieGift.biinieIdentifier).then( function(userGifts) {
                                var giftToSendNotification = _.findWhere(userGifts, {identifier: biinieGift.identifier});
                                var data = {};
                                data.type = "giftassigned";
                                data.gift = validations.validateGiftInfo(giftToSendNotification);
                                var dataContainer = {};
                                dataContainer.data = data;

                                notificationsManager.sendToUser(biinieGift.biinieIdentifier, "Has obtenido un nuevo regalo", "Tienes un nuevo regalo en tu baul.",null,null,dataContainer).then( function () {
                                    res.json({status: "0", result: "1", data: {}});
                                }, function () {
                                    res.json({status: "5", result: "0", data: {}});
                                })
                            }, function () {
                                res.json({status: "6", result: "0", data: {}});
                            });



                        } else {
                            res.json({status: "4", result: "0", data: {}});
                        }
                    });
                }

            })

        }

    });

};

exports.claimGift = function (req, res) {
    var biiniesGift = req.body.model.giftIdentifier;
    giftsPerBiinie.findOne({identifier: biiniesGift}, {}, function (err, gift) {
        if (err) {
            res.json({status: "1", result: "0", data: {}});
        } else {
            gift.isClaimed = true;
            gift.status = giftsStatus.CLAIMED;
            gift.claimedDate = Date.now();
            gift.save(function (err) {
                if (err)
                    res.json({status: "1", result: "0", data: {}});
                else {
                    res.json({status: "0", result: "1", data: {}});
                }
            });
        }
    });
};

exports.deliverGift = function (req, res) {
    var biiniesGift = req.body.model.giftIdentifier;
    giftsPerBiinie.findOne({identifier: biiniesGift}, {}, function (err, gift) {
        if (err) {
            res.json({status: "1", result: "0", data: {}});
        } else {
            gift.isClaimed = true;
            gift.status = giftsStatus.DELIVERED;
            gift.deliveredDate = Date.now();
            gift.save(function (err) {
                if (err)
                    res.json({status: "1", result: "0", data: {}});
                else {
                    res.json({status: "0", result: "1", data: {}});
                }
            });
        }
    });
};