var math = require('mathjs');
var ratingSites = require('../../models/ratingSites');
var organization = require('../../models/organization');
var mobileUser = require('../../models/mobileUser');
var gifts = require('../../models/gifts');
var giftsPerBiinie = require('../../models/giftsPerBiinie');
var giftsPerSites = require('../../models/giftsPerSite');
var giftsStatus = require('../enums/giftstatusenum');
var _ = require('underscore');
var utils = require('../utils.server.controller');
var notificationsManager = require('../notifications.server.controller');

exports.putRating = function (req, res) {
    var reqData = req.body.model;
    var siteId = reqData.siteId;
    var userId = reqData.userId;
    var rating = reqData.rating;
    var comment = reqData.comment;
    var date = Date.now();

    var objectToSave = {};

    objectToSave.identifier = utils.getGUID();
    objectToSave.siteIdentifier = siteId;
    objectToSave.userIdentifier = userId;
    objectToSave.rating = parseInt(rating);
    objectToSave.comment = comment;
    objectToSave.date = date;
    objectToSave.gift = null;


    ratingSites.create(objectToSave, function (err, objectToSave) {
        if (err)
            res.status(200).json({data: {}, status: "1", result: "0"});
        else{
            assignIfItsAbleGift(siteId,userId,objectToSave.identifier).then(function() {
                res.status(200).json({data: objectToSave, status: "0", result: "1"});
            }).catch(function() {
                res.status(200).json({data: {}, status: "1", result: "0"});
            });

        }
    });
};


function assignIfItsAbleGift(siteId,biinieIdentifier,npsCommentIdentifier) {
    return new Promise(function (reject, resolve) {
        giftsPerSites.findOne({
            siteIdentifier: siteId,
            status: "ACTIVE"
        }, {}).populate("gift").exec(function (err, autoGiftAssigned) {
            if (err) {
                reject({message: err, code: 1});
            } else {
                if (autoGiftAssigned) {
                    if (autoGiftAssigned.gift.amountSpent < autoGiftAssigned.gift.amount || autoGiftAssigned.gift.amount == -1) {

                        giftsPerBiinie.findOne({
                            "gift.identifier": autoGiftAssigned.gift.identifier,
                            "biinieIdentifier": biinieIdentifier,
                            status: {$in: [giftsStatus.SENT, giftsStatus.APPROVED, giftsStatus.CLAIMED]}
                        }, {}, function (err, actualgift) {
                            if (err) {
                                reject({message: err, code: 2});
                            } else {
                                if (actualgift) {
                                    resolve({isAssign: false});
                                } else {
                                    autoGiftAssigned.gift.amountSpent = autoGiftAssigned.gift.amountSpent + 1;

                                    var newBiinieGift = new giftsPerBiinie();
                                    newBiinieGift.gift = autoGiftAssigned.gift;
                                    newBiinieGift.identifier = utils.getGUID();
                                    newBiinieGift.biinieIdentifier = biinieIdentifier;
                                    newBiinieGift.save(function (err, binnieGiftSaved) {
                                        if (err)
                                            reject({message: err, code: 3});
                                        else
                                            gifts.update({_id: autoGiftAssigned.gift._id}, autoGiftAssigned.gift, function (err) {
                                                if (err)
                                                    reject({message: err, code: 4});
                                                else {
                                                    if (binnieGiftSaved) {
                                                        ratingSites.findOne({identifier: npsCommentIdentifier}, {}, function (err, comment) {
                                                            if (err) {
                                                                reject({message: err, code: 5});
                                                            } else {
                                                                comment.gift = binnieGiftSaved;
                                                                comment.save(function (err) {
                                                                    if (err) {
                                                                        reject({message: err, code: 6});
                                                                    } else {
                                                                        mobileGiftCalls.getBiiniesGifts(biinieIdentifier).then( function(userGifts){

                                                                            var giftToSendNotification = _.findWhere(userGifts,{identifier:newBiinieGift.identifier});
                                                                            var data = {};
                                                                            data.type = "giftassigned";
                                                                            data.gift = validations.validateGiftInfo(giftToSendNotification);
                                                                            var dataContainer = {};
                                                                            dataContainer.data = data;

                                                                            notificationsManager.sendToUser(biinieIdentifier, "Has obtenido un nuevo regalo", "Tienes un nuevo regalo en tu baul.",null,null,dataContainer).then( function () {
                                                                                res.status(200).json({});
                                                                            }, function (err) {
                                                                                res.status(500).json(err);
                                                                            });
                                                                        }, function(err){
                                                                            res.status(500).json(err);
                                                                        });
                                                                    }
                                                                })
                                                            }
                                                        });

                                                    } else {
                                                        reject({message: err, code: 7});
                                                    }
                                                }
                                            });
                                    });
                                }
                            }
                        });
                    } else {
                        autoGiftAssigned.status = "CANCELED";
                        autoGiftAssigned.save(function (err) {
                            if (err) {
                                reject({message: err, code: 2});
                            } else {
                                resolve({isAssign: true});
                            }
                        });
                    }
                } else {
                    resolve({isAssign: false});
                }
            }
        });
    });
}
