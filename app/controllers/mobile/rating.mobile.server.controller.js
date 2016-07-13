var math = require('mathjs');
var ratingSites = require('../../models/ratingSites');
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
