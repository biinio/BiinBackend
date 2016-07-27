/**
 * Created by Ivan on 7/27/16.
 */
var cards = require('../../models/cards');
var utils = require('../utils.server.controller');

exports.getCardsList = function(req,res){
    var organizationIdentifier = req.params.identifier;
    cards.find({organizationIdentifier:organizationIdentifier, isDeleted:false},{},function(err,cardsFound){
       if(err){
           res.status(500).json(err);
       } else {
           res.status(200).json(cardsFound);
       }
    });
};

exports.updateCard = function(){

};

exports.deleteCard = function(){
    var cardIdentifier = req.params.cardidentifier;
    cards.findOne({identifier: cardIdentifier}, {}, function (err, card) {
        if (err) {
            res.status(500).json(err);
        } else {
            if (card) {
                card.isDeleted = true;
                card.save(function (err) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        res.status(204).send();
                    }
                })
            } else {
                res.status(500).json({message: "card not found"});
            }
        }
    });
};

exports.createCard = function(){
    var newCard = new cards();
    var orgID = req.params["identifier"];
    newCard.identifier = utils.getGUID();
    newCard.organizationIdentifier = orgID;
    newCard.save(function (err, card) {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(201).json(card);
        }
    });
};