/**
 * Created by Ivan on 6/26/16.
 */
module.exports = function(){
    var gifts = require('../schemas/gifts');
    var utils = require('../biin_modules/utils')();

    var functions = {};

    functions.get = function(req, res){
        var orgID = req.params["identifier"];
        gifts.find({organizationIdentifier:orgID,isDeleted:false},{},function(err,giftsToSend){
            if(err){
                res.status(500).json(err);
            } else {
                res.json(giftsToSend);
            }
        });
    };

    functions.create = function(req,res){
        var newGift = new gifts();
        var orgID = req.params["identifier"];
        newGift.identifier = utils.getGUID();
        newGift.organizationIdentifier = orgID;
        newGift.save(function(err,gift){
           if(err){
               res.status(500).json(err);
           }else{
               res.json(gift);
           }
        });
    };

    functions.update = function(req,res){
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
            {upsert: false, new:true},
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

    functions.remove = function(req,res){
        var objectToDelete = req.body;
        gifts.findOne({identifier:objectToDelete.identifier},{},function(err,gift){
            if(err){
                res.status(500).json(err);
            } else {
                gift.isDeleted  = true;
                gift.save(function(err){
                    if(err){
                        res.status(500).json(err);
                    } else {
                        res.status(204).send();
                    }
                })
            }
        });
    };
    return functions;
};