var math = require('mathjs');
var ratingSites = require('../../models/ratingSites');
var giftsPerSites = require('../../models/giftsPerSite');
var organization = require('../../models/organization');
var mobileUser = require('../../models/mobileUser');
var _ = require('underscore');
var utils = require('../utils.server.controller');

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

    ratingSites.create(objectToSave, function (err, objectToSave) {
        if (err)
            res.status(200).json({data: {}, status: "1", result: "0"});
        else
            res.status(200).json({data: objectToSave, status: "0", result: "1"});
    });
};

exports.getRatings = function (req, res) {
    var siteId = req.headers["siteid"];

    ratingSites.find({siteIdentifier: siteId}, {}, function (err, ratings) {
        if (err)
            res.status(200).json({data: {}, status: "1", result: "0"});
        else
            res.status(200).json({data: ratings, status: "0", result: "1"});
    });
};

exports.getRatingsByOrganization = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var offset = req.headers.offset || 0;
    var siteId = filters.siteId;

    ratingSites.find({siteIdentifier: siteId}, {}, function (err, ratings) {
        if (err)
            res.status(200).json({data: {}, status: "1", result: "0"});
        else
            res.status(200).json({data: ratings, status: "0", result: "1"});
    });
};


exports.getNPSRatings = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var offset = req.headers.offset || 0;
    var siteId = filters.siteId;



    ratingSites.find({siteIdentifier: siteId}, {}).populate('gift').lean().exec(function (err, ratings) {
        if (err)
            res.status(200).json({data: {}, status: "1", result: "0"});
        else {
            var usersID = [];
            for (var i = 0; i < ratings.length; i++) {
                if (usersID.indexOf(ratings[i].userIdentifier) == -1) {
                    usersID.push(ratings[i].userIdentifier)
                }
            }
            mobileUser.find({identifier: {$in: usersID}}, {
                identifier: 1,
                firstName: 1,
                lastName: 1,
                facebookAvatarUrl: 1,
                url: 1
            }, function (err, usersData) {
                if (err)
                    res.status(200).json({data: {}, status: "1", result: "0"});
                else {
                    giftsPerSites.findOne({siteIdentifier: siteId, status:"ACTIVE"},{}).populate("gift").exec(function(err,autoGiftAssigned){
                       if(err){
                           res.status(200).json({data: {}, status: "1", result: "0"});
                       } else {
                           var users = {};
                           for (i = 0; i < usersData.length; i++) {
                               users[usersData[i].identifier] = {};
                               users[usersData[i].identifier].name = usersData[i].firstName + " " + usersData[i].lastName;
                               users[usersData[i].identifier].facebookAvatarUrl = usersData[i].facebookAvatarUrl;
                               users[usersData[i].identifier].url = usersData[i].url;
                           }
                           for (i = 0; i < ratings.length; i++) {
                               ratings[i].user = users[ratings[i].userIdentifier];
                           }
                           ratings.autoGift = autoGiftAssigned;
                           var response = {};
                           response.gift = autoGiftAssigned;
                           response.ratings = ratings;
                           res.status(200).json({data: response, status: "0", result: "1", test: users});
                       }

                    });

                }
            });

        }
    });
};
