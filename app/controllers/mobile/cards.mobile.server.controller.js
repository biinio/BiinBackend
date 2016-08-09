/**
 * Created by Ivan on 8/6/16.
 */
"use strict";

var cards = require('../../models/cards');
var cardsPerBiinie = require('../../models/cardsPerBiinie');
var gifts = require('../../models/gifts');


exports.cardEnroll = function (req, res) {
    let biinieIdentifier = req.params.identifier;
    let cardIdentifier = req.params.cardidentifier;

    cards.findOne({identifier: cardIdentifier}, {}, function (err, card) {
        if (err) {
            res.status(500).json({});
        } else {
            if (card) {
                let cardPerBiinie = new cardsPerBiinie();
                cardPerBiinie.card = card;
                cardPerBiinie.userIdentifier = biinieIdentifier;
                cardPerBiinie.save(function (err, card) {
                    if (err) {
                        res.status(500).json({});
                    } else {
                        res.json(card);
                    }
                });
            } else {
                res.status(500).json({});
            }
        }
    });
};

exports.cardSetStar = function ( req, res){
    let biinieIdentifier = req.params.identifier;
    let cardIdentifier = req.params.cardidentifier;

    cardsPerBiinie.findOne({userIdentifier:biinieIdentifier, identifier : cardIdentifier }, {})
        .populate("card")
        .exec(function ( err, card) {
        if(err){
            res.json({data:{}, status:"1", result:"0"});
        } else {
            if(card){
                if(card.usedSlots < card.card.slots){
                    card.usedSlots++;
                    card.isCompleted = card.usedSlots == card.card.slots;
                    card.save(function (err, card) {
                        if(err){
                            res.json({data:{}, status:"4", result:"0"});
                        } else {
                            res.json({data:{}, status:"0", result:"1"});
                        }
                    })

                } else {
                    res.json({data:{}, status:"3", result:"0"});
                }

            } else {
                res.json({data:{}, status:"2", result:"0"});
            }
        }
    });
};


exports.getUserCards = function (biinieIdentifier) {
    return new Promise(function (resolve, reject) {
        cardsPerBiinie.find({userIdentifier: biinieIdentifier}, {})
            .populate("card")
            .exec(function (err, biinieCards) {
            if (err) {
                reject();
            } else {
                gifts.populate(biinieCards, {
                    path: 'card.gift'
                },function(err,biinieCards){

                for (var i = 0; i < biinieCards.length; i++) {
                    biinieCards[i] =  mobileseBiiniesCards(biinieCards[i]);
                }


                cards.find({isActive: true, isDeleted: false}, {}).lean().exec(function (err, availableCards) {
                    if (err) {
                        reject();
                    } else {

                        for (var i = 0; i < availableCards.length; i++) {
                            availableCards[i] = mobileseCard(availableCards[i]);
                        }

                        var cardsToSend = biinieCards.concat(availableCards);
                        resolve(cardsToSend);
                    }

                })
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
    newCard.elementIdentifier = "";
    newCard.isUnavailable = false;
    newCard.startDate = "";
    newCard.endDate = "";
    newCard.enrolledDate = "";
    newCard.slots = card.slots;
    newCard.usedSlots = 0;

    return newCard;

}


function mobileseBiiniesCards(card){
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
    newCard.usedSlots = 0;

    return newCard;

}