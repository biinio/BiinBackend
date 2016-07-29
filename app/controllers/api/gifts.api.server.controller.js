var gifts = require('../../models/gifts');
var giftsPerBiinie = require('../../models/giftsPerBiinie');
var giftsPerSites = require('../../models/giftsPerSite');
var ratingsSites = require('../../models/ratingSites');
var utils = require('../utils.server.controller');
var organization = require('../../models/organization');
var _ = require('underscore');
var giftsStatus = require('../enums/giftstatusenum');
var notificationsManager = require('../notifications.server.controller');
var mobileGiftCalls = require('../mobile/gifts.mobile.server.controller');
var validations = require('../validations.server.controller');


/**
 *  Gifts calls for api
 */

exports.getGiftsList = function (req, res) {
    var orgID = req.params["identifier"];
    gifts.find({organizationIdentifier: orgID, isDeleted: false}, {}, function (err, giftsToSend) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(giftsToSend);
        }
    });
};

exports.createGift = function (req, res) {
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

exports.updateGift = function (req, res) {
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

exports.removeGift = function (req, res) {
    var giftIdentifier = req.params.giftidentifier;
    gifts.findOne({identifier: giftIdentifier}, {}, function (err, gift) {
        if (err) {
            res.status(500).json(err);
        } else {
            if (gift) {
                gift.isDeleted = true;
                gift.save(function (err) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(204).send();
                    }
                })
            } else {
                res.status(500).json({message: "gift not found"});
            }
        }
    });
};

exports.assignGift = function (req, res) {
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
                                    notificationsManager.sendToUser(biinieIdentifier, "Has obtenido un nuevo regalo", "Tienes un nuevo regalo en tu baul.").then(function () {
                                        res.status(200).json({});
                                    }).catch(function () {
                                        res.status(500).json({});
                                    });

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

exports.assignGiftNPS = function (req, res) {
    var biinieIdentifier = req.body.biinieIdentifier;
    var giftIdentifier = req.body.giftIdentifier;
    var npsCommentIdentifier = req.body.npsCommentIdentifier;

    gifts.findOne({identifier: giftIdentifier}, {}, function (err, gift) {
        if (err)
            res.status(500).json(err);
        else {
            if (gift) {
                if (gift.amountSpent < gift.amount || gift.amount == -1) {

                    giftsPerBiinie.findOne({
                        "gift.identifier": giftIdentifier,
                        "biinieIdentifier": biinieIdentifier,
                        status: {$in: [giftsStatus.SENT, giftsStatus.APPROVED, giftsStatus.CLAIMED]}
                    }, {}, function (err, actualgift) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            if (actualgift) {
                                res.status(500).json({message: "There is a gift pending to claimed"});
                            } else {
                                gift.amountSpent = gift.amountSpent + 1;

                                var newBiinieGift = new giftsPerBiinie();
                                newBiinieGift.gift = gift;
                                newBiinieGift.identifier = utils.getGUID();
                                newBiinieGift.biinieIdentifier = biinieIdentifier;
                                newBiinieGift.save(function (err, binnieGiftSaved) {
                                    if (err)
                                        res.status(500).json(err);
                                    else
                                        gift.save(function (err) {
                                            if (err)
                                                res.status(500).json(err);
                                            else {
                                                if (binnieGiftSaved) {
                                                    ratingsSites.findOne({identifier: npsCommentIdentifier}, {}, function (err, comment) {
                                                        if (err) {
                                                            res.status(500).json(err);
                                                        } else {
                                                            comment.gift = binnieGiftSaved;
                                                            comment.save(function (err) {
                                                                if (err) {
                                                                    res.status(500).json(err);
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
                                                    res.status(500).json(err);
                                                }
                                            }
                                        });
                                });
                            }
                        }
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

exports.assignAutoGiftNPS = function (req, res) {
    var giftIdentifier = req.body.giftIdentifier;
    var siteIdentifier = req.body.siteIdentifier;

    gifts.findOne({identifier: giftIdentifier}, {}, function (err, giftToAssign) {
        if (err) {
            res.status(500).json(err);
        } else if (giftToAssign) {
            var giftPerSite = new giftsPerSites();
            giftPerSite.siteIdentifier = siteIdentifier;
            giftPerSite.identifier = utils.getGUID();
            giftPerSite.gift = giftToAssign;

            giftPerSite.save(function (err) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({})
                }
            });

        } else {
            {
                message: "There is no gift"
            }
        }
    });

};

exports.cancelAutoGiftNPS = function (req, res) {
    var relationIdentifier = req.body.relationIdentifier;

    giftsPerSites.findOne({identifier: relationIdentifier}, {}, function (err, giftPerSite) {
        if (err) {
            res.status(500).json(err);
        } else {
            giftPerSite.status = "CANCELED";
            giftPerSite.save(function (err) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    res.status(200).json({});
                }
            });

        }
    })


};

exports.deliverGiftNPS = function (req, res) {
    var npsCommentIdentifier = req.body.npsCommentIdentifier;
    var biinieIdentifier = req.body.biinieIdentifier;
    ratingsSites.findOne({identifier: npsCommentIdentifier}, {}, function (err, comment) {
        if (err) {
            res.status(500).json(err);
        } else {
            giftsPerBiinie.findOne({_id: comment.gift}, {}, function (err, giftPerBiinie) {
                if (err) {
                    res.status(500).json(err);
                } else {
                    giftPerBiinie.status = giftsStatus.DELIVERED;
                    giftPerBiinie.deliveredDate = Date.now();
                    giftPerBiinie.save(function (err) {
                        if (err) {
                            res.status(500).json(err);
                        } else {
                            var dataContainer = {};
                            var data = {};
                            data.type = "giftapproved";
                            data.giftIdentifier = giftPerBiinie.identifier;
                            dataContainer.data = data;

                            notificationsManager.sendToUser(biinieIdentifier, "Tu regalo ha sido aceptado", "Pronto recibirás el regalo que has reclamado.", null, null, dataContainer).then(function () {
                                res.status(200).json({});
                            }).catch(function (err) {
                                res.status(500).json(err);
                            });
                        }
                    })

                }
            })
        }
    });
};

exports.getGiftsAvailable = function (req, res) {
    var siteIdentifier = req.params.sitesidentifier;
    var typeIdentifier = req.params.typegift;
    var automatic = req.params.automatic;
    var isAutomatic = automatic == "true";

    gifts.find({
        sites: siteIdentifier,
        availableIn: typeIdentifier,
        isAutomatic: isAutomatic,
        isActive: true,
        isDeleted: false
    }, {}, function (err, giftsFound) {
        if (err)
            res.status(500).json(err);
        else {
            res.status(200).json(giftsFound);
        }
    })

};

exports.getUpdatedAmount = function (req, res) {
    var orgID = req.params["identifier"];
    gifts.find({organizationIdentifier: orgID, isDeleted: false}, {
        identifier: 1,
        amountSpent: 1
    }, function (err, giftsToSend) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.json(giftsToSend);
        }
    });
};