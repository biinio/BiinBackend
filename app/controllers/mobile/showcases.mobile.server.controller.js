//Packages
var moment = require('moment');

//Custom Utils
var _ = require('underscore');
var imageManager = require("../image.server.controller"),
    utils = require('../utils.server.controller');

//Schemas
var organization = require('../../models/organization');
var showcase = require('../../models/showcase');
var region = require('../../models/region');
var mobileUser = require('../../models/mobileUser');

exports.getMobileShowcase = function (req, res) {
    var identifier = req.param("identifier");
    var biinieIdentifier = req.param("biinieIdentifier");
    //biinie getShowcase
    showcase.findOne({"identifier": identifier}, {
        "identifier": 1,
        "showcaseType": 1,
        "name": 1,
        "description": 1,
        "titleColor": 1,
        "lastUpdate": 1,
        "elements.elementIdentifier": 1,
        "elements._id": 1,
        "elements.position": 1,
        "notifications": 1,
        "webAvailable": 1
    }).lean().exec(function (err, data) {
        if (err)
            res.json({data: {}, status: "7", result: "0"});
        else if (typeof(data) === 'undefined' || data === null || data.length === 0)
            res.json({data: {status: "9", data: {}}});
        else {
            var showcaseObj = {}

            showcaseObj.elements = _.sortBy(data.elements, 'position');
            showcaseObj.title = data.name ? data.name : "";
            showcaseObj.subTitle = data.description ? data.description : "";
            showcaseObj.titleColor = data.titleColor ? data.titleColor.replace('rgb(', '').replace(')', '') : "0,0,0";
            showcaseObj.lastUpdate = data.lastUpdate & data.lastUpdate != "" ? data.lastUpdate : utils.getDateNow();
            showcaseObj.identifier = data.identifier ? data.identifier : "";
            showcaseObj.notifications = data.notifications;
            showcaseObj.activateNotification = data.activateNotification ? data.activateNotification : "0";
            showcaseObj.webAvailable = data.webAvailable;
            showcaseObj.showcaseType = data.showcaseType ? data.showcaseType : "1";

            mobileUser.findOne({'identifier': biinieIdentifier}, {seenElements: 1}, function (err, seenElementsFound) {
                if (err)
                    throw err;
                else {
                    for (var el = 0; el < showcaseObj.elements.length; el++) {
                        var found = _.findWhere(seenElementsFound.seenElements, {elementIdentifier: showcaseObj.elements[el]._id});
                        if (typeof(found) !== 'undefined')
                            showcaseObj.elements[el].hasBeenSeen = '1';
                        else
                            showcaseObj.elements[el].hasBeenSeen = '0';
                    }

                    res.json({data: showcaseObj, status: "0", result: "1"});
                }

            });
        }
    });

};
