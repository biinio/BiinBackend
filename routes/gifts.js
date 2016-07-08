/**
 * Created by Ivan on 6/26/16.
 */
module.exports = function () {
    var gifts = require('../schemas/gifts');
    var giftsPerBiinie = require('../schemas/giftsPerBiinie');
    var utils = require('../biin_modules/utils')();
    var organization = require('../schemas/organization');
    var _ = require('underscore');
    var giftsStatus = require('../biin_modules/giftstatusenum');
    var notificationsManager = require('../biin_modules/notificationsManager')();

    var functions = {};


    /**
     *  Gifts calls for api
     */

    functions.get = function (req, res) {
        var orgID = req.params["identifier"];
        gifts.find({organizationIdentifier: orgID, isDeleted: false}, {}, function (err, giftsToSend) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.json(giftsToSend);
            }
        });
    };

    functions.create = function (req, res) {
        var newGift = new gifts();
        var orgID = req.params["identifier"];
        newGift.identifier = utils.getGUID();
        newGift.organizationIdentifier = orgID;
        newGift.save(function (err, gift) {
            if (err) {
                res.status(500).json(err);
            } else {
                res.status(201).json(gift);
            }
        });
    };


    functions.getBiiniesGifts = function (biinieIdentifier) {
        return new Promise(function (resolve, reject) {
            giftsPerBiinie.find({
                "biinieIdentifier": biinieIdentifier,
                "gift.productIdentifier": { $ne: "" },
                "gift.sites": { $ne: [] },
                "status": {$ne : giftsStatus.REFUSED }
            }, {}).lean().exec(function (err, giftsFound) {
                if (err) {
                    reject(err);
                } else {
                    if(giftsFound.length > 0) {
                        var elementsToFind = [];
                        elementsToFind = _.map(giftsFound,function(gift){
                            return gift.gift.productIdentifier;
                        });
                        elementsToFind = _.uniq(elementsToFind);

                        organization.find( {"elements.elementIdentifier" : {$in : elementsToFind}} , {identifier:1, elements:1, primaryColor:1, secondaryColor:1} ,function(err,organizations){
                            if(err){
                                reject(err);
                            } else {
                                var elements = [];

                                for (var i = 0; i < organizations.length; i++) {
                                    var org = organizations[i];
                                    elements = elements.concat(org.elements);
                                }
                                for (var i = 0; i < giftsFound.length; i++) {
                                    var gift = giftsFound[i];
                                    var element = _.findWhere(elements,{elementIdentifier : gift.gift.productIdentifier});
                                    var org = _.findWhere(organizations,{identifier : gift.gift.organizationIdentifier});
                                    if(element && org){
                                        gift.gift.media = element.media;
                                        gift.gift.primaryColor = org.primaryColor;
                                        gift.gift.secondaryColor = org.secondaryColor;
                                    } else {
                                        giftsFound = giftsFound.splice(i,1);
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

    functions.update = function (req, res) {
        var orgID = req.params["identifier"];
        var giftIdenfifier = req.params["giftidentifier"];
        var giftData = req.body;

        var set = {};
        for (var field in giftData) {
            set[field] = giftData[field];
        }

        gifts.findOneAndUpdate(
            {identifier: giftIdenfifier},
            {$set: set},
            {upsert: false, new: true},
            function (err, document) {
                if (err) {
                    res.status(500).json(err);
                }
                else {
                    res.status(200).json(document);
                }
            }
        );
    };

    functions.remove = function (req, res) {
        var objectToDelete = req.body;
        gifts.findOne({identifier: objectToDelete.identifier}, {}, function (err, gift) {
            if (err) {
                res.status(500).json(err);
            } else {
                gift.isDeleted = true;
                gift.save(function (err) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(204).send();
                    }
                })
            }
        });
    };

    functions.assign = function (req, res) {
        var biinieIdentifier = req.body.biinieIdentifier;
        var giftIdentifier = req.body.giftIdentifier;

        gifts.findOne({identifier: giftIdentifier}, {}, function (err, gift) {
            if (err)
                res.status(500).json(err);
            else {
                if (gift) {
                    if (gift.amountSpent < gift.amount || gift.amount == -1) {

                        gift.amountSpent = gift.amountSpent + 1;

                        var newBiinieGift = new giftsPerBiinie();
                        newBiinieGift.gift = gift;
                        newBiinieGift.identifier = utils.getGUID();
                        newBiinieGift.biinieIdentifier = biinieIdentifier;
                        newBiinieGift.save(function (err) {
                            if (err)
                                res.status(500).json(err);
                            else
                                gift.save(function (err) {
                                    if (err)
                                        res.status(500).json(err);
                                    else {
                                        notificationsManager.sendNotificationToUser(biinieIdentifier);
                                        res.status(200).json({});
                                    }
                                });
                        });
                    }
                    else {
                        res.status(500).json({message: "Gift has reached its max amount of gifts allowed"});
                    }
                } else {
                    res.status(500).json({message: "There is no gift"});
                }

            }
        });
    };

    /**
     *  Gifts calls for mobile
     */

    functions.getGifts = function (req, res) {
        var biinieIdentifier = req.params.identifier;
        giftsPerBiinie.find({biinieIdentifier: biinieIdentifier}, {}, function (err, biiniesGifts) {
            if (err) {
                res.json({status: "1", result: "0", data: {}});
            } else {
                res.json(biiniesGifts)
            }
        });
    };

    functions.share = function (req, res) {
        res.json({status: "1", result: "0", data: {}});
    };

    functions.refuse = function (req, res) {
        var biinieGiftIdentifier = req.body.model.giftIdentifier;
        giftsPerBiinie.findOne({identifier: biinieGiftIdentifier},{}, function (err, biinieGift) {
            if(err){
                res.json({status: "1", result: "0", data: {}});
            } else {
                biinieGift.status = giftsStatus.REFUSED;
                biinieGift.save(function (err) {
                    if(err){
                        res.json({status: "1", result: "0", data: {}});
                    } else {
                        res.json({status: "0", result: "1", data: {}});
                    }
                })
            }
        });
    };

    functions.share = function (req, res) {
        res.json({status: "1", result: "0", data: {}});
    };

    functions.claim = function (req, res) {
        var biiniesGift = req.body.biinieGiftIdentifier;
        giftsPerBiinie.findOne({identifier: biiniesGift}, {}, function (err, gift) {
            if (err) {
                res.json({status: "1", result: "0", data: {}});
            } else {
                gift.isClaimed = true;
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

    return functions;
};