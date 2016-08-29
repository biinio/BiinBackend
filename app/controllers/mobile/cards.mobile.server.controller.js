/**
 * Created by Ivan on 8/6/16.
 */
"use strict";

var cards = require('../../models/cards');
var cardsPerBiinie = require('../../models/cardsPerBiinie');
var gifts = require('../../models/gifts');
var codeQRPerSite = require('../../models/qrCodePerSite');
var giftsPerBiinie = require('../../models/giftsPerBiinie');

var utils = require('../utils.server.controller');
var notificationsManager = require('../notifications.server.controller');
var validations = require('../validations.server.controller');
var giftMobileController = require('../mobile/gifts.mobile.server.controller');
var _ = require('underscore');


exports.cardEnroll = function (req, res) {
    let biinieIdentifier = req.params.identifier;
    let cardIdentifier = req.params.cardidentifier;

    cards.findOne({identifier: cardIdentifier}, {}, function (err, card) {
        if (err) {
            res.json({data: {}, status: "1", result: "0"});
        } else {
            if (card) {
                let cardPerBiinie = new cardsPerBiinie();
                cardPerBiinie.card = card;
                cardPerBiinie.userIdentifier = biinieIdentifier;
                cardPerBiinie.save(function (err, card) {
                    if (err) {
                        res.json({data: {}, status: "2", result: "0"});
                    } else {
                        res.json({data: {identifier: card.identifier}, status: "0", result: "1"});
                    }
                });
            } else {
                res.json({data: {}, status: "3", result: "0"});
            }
        }
    });
};

exports.cardSetStar = function (req, res) {
    let biinieIdentifier = req.params.identifier;
    let cardIdentifier = req.params.cardidentifier;
    let qrcodeidentifier = req.params.qrcodeidentifier;
    let siteIdentifier = req.params.siteIdentifier;


    codeQRPerSite.findOne({
        identifier: qrcodeidentifier,
        siteIdentifier: siteIdentifier,
        isActive: true
    }, {}, function (err, qrCodeStatus) {
        if (err) {
            res.json({data: {}, status: "4", result: "0"});
        } else if (qrCodeStatus) {

            cardsPerBiinie.findOne({userIdentifier: biinieIdentifier, identifier: cardIdentifier}, {})
                .populate("card")
                .exec(function (err, card) {
                    if (err) {
                        res.json({data: {}, status: "1", result: "0"});
                    } else {
                        if (card) {
                            if (card.usedSlots < card.card.slots) {
                                card.usedSlots++;
                                card.save(function (err, card) {
                                    if (err) {
                                        res.json({data: {}, status: "4", result: "0"});
                                    } else {
                                        res.json({data: {}, status: "0", result: "1"});
                                    }
                                })

                            } else {
                                res.json({data: {}, status: "3", result: "0"});
                            }

                        } else {
                            res.json({data: {}, status: "2", result: "0"});
                        }
                    }
                });
        } else {
            res.json({data: {}, status: "5", result: "0"});
        }
    });
};

exports.getUserCards = function (biinieIdentifier) {
    return new Promise(function (resolve, reject) {
        cardsPerBiinie.find({userIdentifier: biinieIdentifier }, {})
            .populate("card")
            .exec(function (err, biinieCards) {
                if (err) {
                    reject();
                } else {
                    gifts.populate(biinieCards, {
                        path: 'card.gift'
                    }, function (err, biinieCards) {
                        if (err) {
                            reject();
                        } else {
                            cards.find({
                                isActive: true,
                                isDeleted: false
                            }, {}).populate("gift").lean().exec(function (err, availableCards) {
                                if (err) {
                                    reject();
                                } else {

                                    biinieCards = JSON.parse(JSON.stringify(biinieCards));


                                    let cardsOnWaiting  = _.filter(biinieCards,function(biiniesCard){
                                        return biiniesCard.isCompleted && biiniesCard.availableAgain && new Date(biiniesCard.availableAgain) >= Date.now();
                                    });

                                    //Removing cards that needs to wait to enroll again
                                    availableCards = _.filter(availableCards,function (availableCard) {
                                        let result = _.find(cardsOnWaiting, function (biinieCard) {
                                            return biinieCard.card.identifier == availableCard.identifier;
                                        });
                                        return result == null;
                                    });

                                    biinieCards = _.filter(biinieCards,function(biiniesCard){
                                        return (!biiniesCard.isCompleted || biiniesCard.availableAgain == null) && biiniesCard.card != null;
                                    });


                                    var filteredCardsAvailable = _.filter(availableCards, function (card) {
                                        let result = _.find(biinieCards, function (biinieCard) {
                                            return biinieCard.card.identifier == card.identifier;
                                        });
                                        return result == null;
                                    });

                                    for (var i = 0; i < biinieCards.length; i++) {
                                        biinieCards[i] = mobileseBiiniesCards(biinieCards[i]);
                                    }

                                    for (i = 0; i < filteredCardsAvailable.length; i++) {
                                        filteredCardsAvailable[i] = mobileseCard(filteredCardsAvailable[i]);
                                    }

                                    var cardsToSend = biinieCards.concat(filteredCardsAvailable);


                                    let organizationsIdentifier = _.map(cardsToSend, "organizationIdentifier");
                                    let objectsToSend = [];
                                    organizationsIdentifier.forEach(function (organizationIdentifier) {
                                        let loyaltyObject = {};
                                        loyaltyObject.organizationIdentifier = organizationIdentifier;
                                        loyaltyObject.loyaltyCard = _.findWhere(cardsToSend, {"organizationIdentifier": organizationIdentifier});
                                        objectsToSend.push(loyaltyObject);
                                    });
                                    resolve(objectsToSend);
                                }
                            })
                        }
                    });
                }
            });
    });
};


function mobileseCard(card) {

    var newCard = {};
    newCard.identifier = card.identifier;
    newCard.title = card.title;
    newCard.rule = card.rule;
    newCard.goal = card.goal;
    newCard.conditions = card.conditions;
    newCard.isCompleted = false;
    newCard.isBiinieEnrolled = false;
    newCard.elementIdentifier = card.gift.productIdentifier;
    newCard.isUnavailable = false;
    newCard.startDate = "";
    newCard.endDate = "";
    newCard.enrolledDate = "";
    newCard.slots = card.slots;
    newCard.usedSlots = 0;
    newCard.organizationIdentifier = card.organizationIdentifier;

    return newCard;

}


function mobileseBiiniesCards(card) {
    var newCard = {};
    newCard.identifier = card.identifier;
    newCard.title = card.card.title;
    newCard.rule = card.card.rule;
    newCard.goal = card.card.goal;
    newCard.conditions = card.card.conditions;
    newCard.isCompleted = false;
    newCard.isBiinieEnrolled = true;
    newCard.elementIdentifier = card.card.gift.productIdentifier;
    newCard.isUnavailable = false;
    newCard.startDate = "";
    newCard.endDate = "";
    newCard.enrolledDate = "";
    newCard.slots = card.card.slots;
    newCard.usedSlots = card.usedSlots;
    newCard.organizationIdentifier = card.card.organizationIdentifier;

    return newCard;

}

exports.cardSetComplete = function (req, res) {


    let biinieIdentifier = req.params.identifier;
    let cardIdentifier = req.params.cardidentifier;


    let availableCardOrganization = null;
    let cardInfo = null;

    function getNewCard(orgIdentifier) {
        return new Promise(function (resolve, reject) {
            cards.findOne({
                isActive: true,
                isDeleted: false,
                organizationIdentifier: orgIdentifier
            }, {}).populate("gift").exec(function (err, availableCard) {
                if (err) {
                    reject({data: {}, status: "8", result: "0"});
                } else {
                    availableCardOrganization = availableCard;
                    resolve();
                }
            });
        });
    }

    function setCompletedCard(){
        return new Promise(function(resolve, reject){
            cardsPerBiinie.findOne({userIdentifier: biinieIdentifier, identifier: cardIdentifier}, {})
                .populate("card")
                .exec(function (err, card) {
                    if (err) {
                        reject({data: {}, status: "1", result: "0"});
                    } else {
                        gifts.populate(card, { path: 'card.gift' }, function (err, card) {
                            if (err) {
                                reject({data: {}, status: "2", result: "0"});
                            } else {
                                if (card) {
                                    if (card.usedSlots == card.card.slots - 1) {

                                        card.usedSlots++;
                                        card.isCompleted = card.usedSlots == card.card.slots;
                                        card.endDate = Date.now();
                                        card.availableAgain = Date.now() + (card.card.waitTime * 24 * 60 * 60 * 1000);
                                        cardInfo = card;

                                        card.save(function (err, card) {
                                            if (err) {
                                                res.json({data: {}, status: "3", result: "0"});
                                            } else {
                                                var newBiinieGift = new giftsPerBiinie();
                                                newBiinieGift.gift = card.card.gift;
                                                newBiinieGift.identifier = utils.getGUID();
                                                newBiinieGift.biinieIdentifier = biinieIdentifier;
                                                newBiinieGift.save(function (err) {
                                                    if (err)
                                                        reject({data: {}, status: "6", result: "0"});
                                                    else {

                                                        giftMobileController.getBiiniesGifts(biinieIdentifier).then( function(userGifts) {
                                                            var giftToSendNotification = _.findWhere(userGifts, {identifier: newBiinieGift.identifier});
                                                            var data = {};
                                                            data.type = "giftassigned";
                                                            data.gift = validations.validateGiftInfo(giftToSendNotification);
                                                            var dataContainer = {};
                                                            dataContainer.data = data;

                                                            notificationsManager.sendToUser(biinieIdentifier, "Has obtenido un nuevo regalo", "Tienes un nuevo regalo en tu baul.",null,null,dataContainer).then( function () {
                                                                res.json({status: "0", result: "1", data: {}});
                                                            }, function () {
                                                                res.json({status: "7", result: "0", data: {}});
                                                            })
                                                        }, function () {
                                                            res.json({status: "8", result: "0", data: {}});
                                                        });
                                                    }
                                                });

                                            }
                                        })

                                    } else {
                                        reject({data: {}, status: "4", result: "0"});
                                    }
                                } else {
                                    reject({data: {}, status: "5", result: "0"});
                                }
                            }
                        });
                    }
                });
        });
    }

    function onError(error) {
        res.json(error);
    }

    setCompletedCard().then(function(){
        return getNewCard(cardInfo.card.organizationIdentifier);
    },onError).then(function () {
        if(cardInfo && availableCardOrganization){
            if(availableCardOrganization.identifier == cardInfo.card.identifier){
                if(availableCardOrganization.renewalAutomatic && (availableCardOrganization.isUnlimited ||
                    availableCardOrganization.quantity > availableCardOrganization.amountAssigned) &&
                    availableCardOrganization.waitTime == 0 ){
                    availableCardOrganization.amountAssigned++;
                    availableCardOrganization.save(function (err) {
                        if(err){
                            res.json({data: {}, status: "9", result: "0"});
                        } else {
                            let cardPerBiinie = new cardsPerBiinie();
                            cardPerBiinie.card = cardInfo;
                            cardPerBiinie.userIdentifier = biinieIdentifier;
                            cardPerBiinie.save(function (err, card) {
                                if (err) {
                                    res.json({data: {}, status: "10", result: "0"});
                                } else {
                                    let cardToSend = JSON.parse(JSON.stringify(card));
                                    cardToSend.card = JSON.parse(JSON.stringify(cardInfo.card));
                                    res.json({data:{hasNewCard:"1",newCard:mobileseBiiniesCards(cardToSend)}, status:"0", result:"1"});
                                }
                            });
                        }
                    });

                } else {
                    res.json({data:{hasNewCard:"0",newCard:{}}, status:"0", result:"1"});
                }
            } else {
                res.json({data:{hasNewCard:"0",newCard:{}}, status:"0", result:"1"});
            }
        } else {
            res.json({data:{}, status:"9", result:"0"});
        }
    },onError)


};