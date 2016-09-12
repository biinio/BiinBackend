var fs = require('fs');
var _ = require('underscore');
var math = require('mathjs');
var util = require('util');


var mobileUser = require('../../models/mobileUser');
var utils = require('../utils.server.controller'),
    moment = require('moment');
var organization = require('../../models/organization'),
    site = require('../../models/site'),
    showcase = require('../../models/showcase'),
    region = require('../../models/region'),
    biin = require('../../models/biin'),
    mobileHistory = require('../../models/tempHistory'),
    siteCategory = require('../../models/searchSiteCategory'),
    biinieDevice = require('../../models/biiniesDevice');

var biinBiinieObject = require('../../models/biinBiinieObject');

var versionsConfig = require('../../../config/versions');

var actionsEnum = require('../enums/actionsenum');

//Tracking schemas
var trackingBeacon = require('../../models/trackingbeacon'),
    trackingFollow = require('../../models/trackingfollows'),
    trackingSites = require('../../models/trackingsites'),
    trackingLikes = require('../../models/trackinglikes'),
    trackingElements = require('../../models/trackingelements'),
    trackingBiined = require('../../models/trackingbiined'),
    trackingShares = require('../../models/trackingshares'),
    trackingNotifications = require('../../models/trackingnotifications');

var SITE_DEFAULT_IMAGE = {
    domainColor: '170, 171, 171',
    mediaType: '1',
    title1: 'default',
    url: 'https://biinapp.blob.core.windows.net/biinmedia/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/media/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/4e8b2fb3-af89-461d-9c37-2cc667c20653/media/4af24d51-2173-4d41-b651-d82f18f00d1b.jpg',
    vibrantColor: '170, 171, 171',
    vibrantDarkColor: '85,86,86',
    vibrantLightColor: '170, 171, 171'
};

//[DEPRECATED]
//GET Sites information by Biinie Categories
exports.getCategories = function (req, res) {
    var userIdentifier = req.param("identifier");
    var xcord = eval(req.param("xcord"));
    var ycord = eval(req.param("ycord"));

    //Get the categories of the user
    mobileUser.findOne({identifier: userIdentifier}, {
        "categories.identifier": 1,
        "categories.name": 1
    }, function (err, foundCategories) {
        if (err) {
            res.json({data: {status: "5", data: {}}});
        } else {
            if (foundCategories && "categories" in foundCategories) {

                if (foundCategories.categories.length === 0)
                    res.json({data: {status: "9", data: {}}});
                else {
                    //var catArray = _.pluck(foundCategories.categories,'identifier')
                    var result = {data: {categories: []}};

                    //Get The sites by Each Category
                    var categoriesProcessed = 0;
                    var categoriesWithSites = 0;

                    ///Get the Sites By categories
                    var getSitesByCat = function (pcategory, index, total, callback) {
                        //Return the sites by Categories
                        var orgResult = organization.find({
                            'sites.categories.identifier': pcategory.identifier,
                            "sites.isValid": true
                        }, {
                            "_id": 0,
                            "sites.identifier": 1,
                            "sites.major": 1,
                            'sites.lat': 1,
                            'sites.lng': 1,
                            "sites.categories.identifier": 1,
                            "sites.categories.identifier": 1,
                            "sites.isValid": 1,
                            "identifier": 1
                        }, function (err, sitesCategories) {
                            if (err)
                                res.json({data: {status: "5", data: {}, err: err}});
                            else {
                                var sitesResult = [];
                                var cantSitesAdded = 0;
                                var hasBiinsToProve = false;
                                var countHasBiins = 0;
                                var hasBiinsProved = 0;
                                //Remove the Organization
                                for (var orgIndex = 0; orgIndex < sitesCategories.length; orgIndex++) {
                                    if ('sites' in sitesCategories[orgIndex])
                                        for (var siteIndex = 0; siteIndex < sitesCategories[orgIndex].sites.length; siteIndex++) {
                                            if (sitesCategories[orgIndex].sites[siteIndex].isValid = true && 'categories' in sitesCategories[orgIndex].sites[siteIndex] && sitesCategories[orgIndex].sites[siteIndex].categories.length > 0) {
                                                //Get the categories of the site
                                                var sitesCat = _.pluck(sitesCategories[orgIndex].sites[siteIndex].categories, 'identifier')

                                                if (_.indexOf(sitesCat, pcategory.identifier) != -1) {
                                                    if (isSiteInRegion(xcord, ycord, eval(sitesCategories[orgIndex].sites[siteIndex].lat), eval(sitesCategories[orgIndex].sites[siteIndex].lng))) {
                                                        hasBiinsToProve = true;
                                                        var hasbiins = function (siteIdentifier) {
                                                            //TODO: Modify this
                                                            biin.findOne({'siteIdentifier': siteIdentifier}, function (err, biinForSite) {
                                                                if (err)
                                                                    throw err;
                                                                else {
                                                                    hasBiinsProved++;
                                                                    ;
                                                                    if (biinForSite) {
                                                                        sitesResult.push({'identifier': siteIdentifier});
                                                                        cantSitesAdded++;
                                                                    }

                                                                    if (countHasBiins === hasBiinsProved) {
                                                                        //Callback function
                                                                        var result = {
                                                                            'identifier': pcategory.identifier,
                                                                            "name": pcategory.name,
                                                                            'sites': sitesResult
                                                                        };
                                                                        callback(index, total, result, cantSitesAdded);
                                                                    }
                                                                }
                                                            })

                                                        }

                                                        countHasBiins++;
                                                        hasbiins(sitesCategories[orgIndex].sites[siteIndex].identifier);

                                                    }
                                                }
                                            }
                                        }
                                }

                                if (!hasBiinsToProve) {
                                    //Callback function
                                    var result = {
                                        'identifier': pcategory.identifier,
                                        "name": pcategory.name,
                                        'sites': sitesResult
                                    };
                                    callback(index, total, result, cantSitesAdded);
                                }

                            }

                        });

                    }

                }

                var finalCursor = function (index, total, data, cantSites) {

                    if (cantSites > 0) {
                        result.data.categories.push(data)
                        categoriesWithSites++;
                    }

                    categoriesProcessed++;

                    //Return the categories if all is processed
                    if (categoriesProcessed === total) {

                        if (categoriesWithSites == 0) {
                            res.json({data: {status: "9", data: {}}});

                        }
                        else {
                            result.status = "0";
                            res.json(result);
                        }

                    }
                }

                //Order the sites by Category Identifier
                for (var i = 0; i < foundCategories.categories.length; i++) {
                    getSitesByCat(foundCategories.categories[i], i, foundCategories.categories.length, finalCursor);
                }
            }
            else {
                res.json({status: "9", data: {}});
            }
        }
    });
};

//Verify if the coords of the user and the site are in the expected radio
function isSiteInRegion(mobX, mobY, siteX, siteY) {
    //Get the Radious in radians, = Radious in meters / kilometers * 360 / Earth Circunference
    if (!eval(process.env.ALLOW_LOCATION_FILTER))
        return true;
    else {
        var radiousRadians = ((eval(process.env.STANDARD_RADIOUS) / 1000) * 360) / eval(process.env.EARTH_CIRCUMFERENCE);
        var resultLat = siteX - mobX;
        var resultLong = siteY - mobY;
        var distance = math.sqrt((resultLat * resultLat) + (resultLong * resultLong));

        return distance <= radiousRadians;
    }
}

//
//GET Site
exports.getSite = function (req, res) {

    var identifier = req.param("identifier");
    var biinieIdentifier = req.param("biinieIdentifier");

    var getSiteInformation = function (err, mobileUser) {

        if (err)
            res.json({data: {status: "7", data: {}}});
        else {
            organization.findOne({"sites.identifier": identifier}, {
                "_id": 0,
                "sites.$": 1,
                "identifier": 1,
                "loyaltyEnabled": 1
            }, function (err, data) {
                if (err)
                    res.json({data: {}, status: "7", result: "0"});
                else if (data == null)
                    res.json({data: {}, status: "9", result: "0"});
                else if (data.sites && data.sites.length) {
                    mapSiteMissingFields(biinieIdentifier, data.sites[0].identifier, data.identifier, data.sites[0], mobileUser, data, function (siteResult) {
                        res.json({data: siteResult, status: "0", result: "1"});
                    });
                }
                else {
                    res.json({data: data.sites[0], status: "0", result: "1"});
                }
            });
        }
    }
    if (biinieIdentifier) {
        mobileUser.findOne({'identifier': biinieIdentifier}, {
            showcaseNotified: 1,
            biinieCollections: 1,
            loyalty: 1,
            "likeObjects": 1,
            "followObjects": 1,
            "biinieCollect": 1,
            "shareObjects": 1
        }, getSiteInformation)
    } else {
        res.json({status: "7", data: {}, result: "0"});
    }
}

//------------------  History Services  ------------------//
//Set a Mobile History Actions of an User
exports.setHistory = function (req, res) {
    var identifier = req.param('identifier');
    var model = req.body.model;

    Promise.all([setTrackingBiined(model.actions, identifier),
        setTrackingBeacon(model.actions, identifier),
        setTrackingElements(model.actions, identifier),
        setTrackingLike(model.actions, identifier),
        setTrackingSites(model.actions, identifier),
        setTrackingFollow(model.actions, identifier),
        setTrackingNotifications(model.actions, identifier),
        setTrackingShare(model.actions, identifier),
    ]).then(function (b) {
        res.status(200).json({data: {}, status: "0", result: "1"});
    }).catch(function (a) {
        res.status(500).json({data: {}, status: "7", result: "0"});
    })

};

function setTrackingBiined(actions, userIdentifier) {
    return new Promise(function (resolve, reject) {
        var filteredActions = _.filter(actions, function (item) {
            return item.did == actionsEnum.LIKE_ELEMENT;
        });

        if (filteredActions.length == 0) {
            resolve();
        } else {
            var elementsToFind = _.uniq(_.pluck(filteredActions, "to"));

            organization.find(
                {
                    "elements.elementIdentifier": {$in: elementsToFind}
                },
                {
                    "identifier": 1,
                    "elements.elementIdentifier": 1
                }).lean().exec(
                function (err, orgData) {
                    if (err)
                        reject(err);

                    var actionsToInsert = [];
                    for (var i = 0; i < filteredActions.length; i++) {

                        var elementExtraInfo = _.find(orgData, function (org) {
                            return _.findWhere(org.elements, {elementIdentifier: filteredActions[i].to}) != null;
                        });
                        if (elementExtraInfo) {
                            var action = {};

                            action.userIdentifier = userIdentifier;
                            action.organizationIdentifier = elementExtraInfo.identifier;
                            action.elementIdentifier = filteredActions[i].to;
                            action.siteIdentifier = filteredActions[i].by;

                            action.date = new Date(filteredActions[i].at);
                            action.action = filteredActions[i].did;
                            actionsToInsert.push(action);
                        }
                    }
                    if (actionsToInsert.length == 0)
                        resolve();
                    else
                        trackingBiined.create(actionsToInsert, function (error) {
                            if (error)
                                reject(error);
                            resolve();
                        });
                });
        }
    });
}

function setTrackingBeacon(actions, userIdentifier) {
    return new Promise(function (resolve, reject) {
        var filteredActions = _.filter(actions, function (item) {
            return item.did == actionsEnum.ENTER_BIIN || item.did == actionsEnum.EXIT_BIIN
                || item.did == actionsEnum.ENTER_BIIN_REGION || item.did == actionsEnum.EXIT_BIIN_REGION ||
                    item.did == actionsEnum.ON_EXIT_SITE || item.did == actionsEnum.ON_EXIT_SITE;
        });

        if (filteredActions.length > 0) {
            var biinsToFind = _.uniq(_.pluck(filteredActions, "to"));
            biin.find({identifier: {$in: biinsToFind}}, {
                identifier: 1,
                organizationIdentifier: 1,
                siteIdentifier: 1
            }, function (err, biinData) {
                if (err)
                    reject(err);
                var actionsToInsert = [];
                for (var i = 0; i < filteredActions.length; i++) {
                    var biinExtraInfo = _.findWhere(biinData, {identifier: filteredActions[i].to});
                    if (biinExtraInfo) {
                        var action = {};

                        action.userIdentifier = userIdentifier;
                        action.beaconIdentifier = filteredActions[i].to;
                        action.organizationIdentifier = biinExtraInfo.organizationIdentifier;
                        action.siteIdentifier = biinExtraInfo.siteIdentifier;
                        action.date = new Date(filteredActions[i].at);
                        action.action = filteredActions[i].did;

                        actionsToInsert.push(action);
                    }

                }
                if (actionsToInsert.length == 0)
                    resolve();
                else
                    trackingBeacon.create(actionsToInsert, function (error) {
                        if (error)
                            reject(error);
                        resolve();
                    });
            });
        } else {
            resolve();
        }
    });
}

function setTrackingElements(actions, userIdentifier) {
    return new Promise(function (resolve, reject) {
        var filteredActions = _.filter(actions, function (item) {
            return item.did == actionsEnum.ENTER_ELEMENT_VIEW || item.did == actionsEnum.EXIT_ELEMENT_VIEW
        });
        if (filteredActions.length > 0) {
            var elementsToFind = _.uniq(_.pluck(filteredActions, "to"));
            organization.find({"elements.elementIdentifier": {$in: elementsToFind}}, {
                "identifier": 1,
                "elements.elementIdentifier": 1
            }).lean().exec(function (err, elementData) {
                if (err)
                    reject(err);
                var actionsToInsert = [];
                for (var i = 0; i < filteredActions.length; i++) {
                    var elementExtraInfo = _.find(elementData, function (org) {
                        return _.findWhere(org.elements, {elementIdentifier: filteredActions[i].to}) != null;
                    });
                    if (elementExtraInfo) {
                        var action = {};

                        action.userIdentifier = userIdentifier;
                        action.organizationIdentifier = elementExtraInfo.identifier;
                        action.elementIdentifier = filteredActions[i].to;
                        action.date = new Date(filteredActions[i].at);
                        action.action = filteredActions[i].did;

                        actionsToInsert.push(action);
                    }


                }
                if (actionsToInsert.length == 0)
                    resolve();
                else
                    trackingElements.create(actionsToInsert, function (error) {
                        if (error)
                            reject(error);
                        resolve();
                    });
            });
        } else {
            resolve();
        }
    });
}

function setTrackingFollow(actions, userIdentifier) {
    return new Promise(function (resolve, reject) {
        var filteredActions = _.filter(actions, function (item) {
            return item.did == actionsEnum.FOLLOW_SITE || item.did == actionsEnum.UNFOLLOW_SITE
        })
        if (filteredActions.length > 0) {
            var sitesToFind = _.uniq(_.pluck(filteredActions, "to"));
            organization.find({"sites.identifier": {$in: sitesToFind}}, {
                "identifier": 1,
                "sites.identifier": 1
            }).lean().exec(function (err, siteData) {
                if (err)
                    reject(err);
                var actionsToInsert = [];
                for (var i = 0; i < filteredActions.length; i++) {
                    var siteExtraInfo = _.find(siteData, function (org) {
                        return _.findWhere(org.sites, {identifier: filteredActions[i].to}) != null;
                    });
                    if (siteExtraInfo) {
                        var action = {};

                        action.userIdentifier = userIdentifier;
                        action.organizationIdentifier = siteExtraInfo.identifier;
                        action.siteIdentifier = filteredActions[i].to;
                        action.date = new Date(filteredActions[i].at);
                        action.action = filteredActions[i].did;

                        actionsToInsert.push(action);
                    }

                }
                if (actionsToInsert.length == 0)
                    resolve();
                else
                    trackingFollow.create(actionsToInsert, function (error) {
                        if (error)
                            reject(error);
                        resolve();
                    });
            });
        } else {
            resolve();
        }
    });
}

function setTrackingLike(actions, userIdentifier) {
    return new Promise(function (resolve, reject) {
        var filteredActions = _.filter(actions, function (item) {
            return item.did == actionsEnum.LIKE_SITE || item.did == actionsEnum.UNLIKE_SITE
        });
        if (filteredActions.length > 0) {
            var sitesToFind = _.uniq(_.pluck(filteredActions, "to"));
            organization.find({"sites.identifier": {$in: sitesToFind}}, {
                "identifier": 1,
                "sites.identifier": 1
            }).lean().exec(function (err, siteData) {
                if (err)
                    reject(err);
                var actionsToInsert = [];
                for (var i = 0; i < filteredActions.length; i++) {
                    var siteExtraInfo = _.find(siteData, function (org) {
                        return _.findWhere(org.sites, {identifier: filteredActions[i].to}) != null;
                    });
                    if (siteExtraInfo) {
                        var action = {};

                        action.userIdentifier = userIdentifier;
                        action.organizationIdentifier = siteExtraInfo.identifier;
                        action.siteIdentifier = filteredActions[i].to;
                        action.date = new Date(filteredActions[i].at);
                        action.action = filteredActions[i].did;

                        actionsToInsert.push(action);
                    }

                }
                if (actionsToInsert.length == 0)
                    resolve();
                else
                    trackingLikes.create(actionsToInsert, function (error) {
                        if (error)
                            reject(error);
                        resolve();
                    });
            });
        } else {
            resolve();
        }
    });
}

function setTrackingShare(actions, userIdentifier) {
    return new Promise(function (resolve, reject) {
        var filteredActions = _.filter(actions, function (item) {
            return item.did == actionsEnum.SHARE_SITE || item.did == actionsEnum.SHARE_ELEMENT
        });
        if (filteredActions.length > 0) {
            var sitesToFind = _.uniq(_.pluck(filteredActions, "to"));
            organization.find({
                $or: [
                    {"elements.elementIdentifier": {$in: sitesToFind}},
                    {"sites.identifier": {$in: sitesToFind}}
                ]
            }, {
                "identifier": 1,
                "elements.elementIdentifier": 1,
                "sites.identifier": 1
            }).lean().exec(function (err, siteData) {
                if (err)
                    reject(err);
                var actionsToInsert = [];
                for (var i = 0; i < filteredActions.length; i++) {
                    var siteExtraInfo = _.find(siteData, function (org) {
                        return _.findWhere(org.sites, {identifier: filteredActions[i].to}) != null;
                    });

                    var elementExtraInfo = _.find(siteData, function (org) {
                        return _.findWhere(org.elements, {elementIdentifier: filteredActions[i].to}) != null;
                    });
                    var action = {};
                    if (siteExtraInfo) {

                        action.userIdentifier = userIdentifier;
                        action.organizationIdentifier = siteExtraInfo.identifier;
                        action.siteIdentifier = filteredActions[i].to;
                        action.date = new Date(filteredActions[i].at);
                        action.action = filteredActions[i].did;
                        actionsToInsert.push(action);

                    } else if (elementExtraInfo) {
                        action.userIdentifier = userIdentifier;
                        action.organizationIdentifier = elementExtraInfo.identifier;
                        action.elementIdentifier = filteredActions[i].to;
                        action.siteIdentifier = filteredActions[i].by;
                        action.date = new Date(filteredActions[i].at);
                        action.action = filteredActions[i].did;
                        actionsToInsert.push(action);
                    }
                }
                if (actionsToInsert.length == 0)
                    resolve();
                else
                    trackingShares.create(actionsToInsert, function (error) {
                        if (error)
                            reject(error);
                        resolve();
                    });
            });
        } else {
            resolve();
        }
    });
}

function setTrackingNotifications(actions, userIdentifier) {
    return new Promise(function (resolve, reject) {
        var filteredActions = _.filter(actions, function (item) {
            return item.did == actionsEnum.NOTIFICATION_OPENED || item.did == actionsEnum.BIIN_NOTIFIED
        });
        if (filteredActions.length > 0) {
            var objectsToFind = _.uniq(_.pluck(filteredActions, "to"));

            biin.find({"objects._id": {$in: objectsToFind}}, {
                "identifier": 1,
                'objects': 1,
                "organizationIdentifier": 1,
                "siteIdentifier": 1
            }).lean().exec(function (err, biinData) {
                if (err)
                    reject(err);
                var actionsToInsert = [];
                for (var i = 0; i < filteredActions.length; i++) {
                    var biinExtraInfo = _.find(biinData, function (data) {
                        return _.find(data.objects, function (dataObject) {
                                return dataObject._id.valueOf() == filteredActions[i].to;
                            }) != null;
                    });
                    if (biinExtraInfo) {
                        var action = {};

                        action.userIdentifier = userIdentifier;
                        action.organizationIdentifier = biinExtraInfo.organizationIdentifier;
                        action.siteIdentifier = biinExtraInfo.siteIdentifier;
                        action.beaconIdentifier = biinExtraInfo.identifier;
                        action.objectIdentifier = filteredActions[i].to;
                        action.date = new Date(filteredActions[i].at);
                        action.action = filteredActions[i].did;

                        actionsToInsert.push(action);
                    }

                }
                if (actionsToInsert.length == 0)
                    resolve();
                else
                    trackingNotifications.create(actionsToInsert, function (error) {
                        if (error)
                            reject(error);
                        resolve();
                    });
            });
        } else {
            resolve();
        }
    });
}

function setTrackingSites(actions, userIdentifier) {
    return new Promise(function (resolve, reject) {
        var filteredActions = _.filter(actions, function (item) {
            return item.did == actionsEnum.ENTER_SITE_VIEW || item.did == actionsEnum.EXIT_SITE_VIEW || item.did == actionsEnum.SHARE_SITE
        });
        if (filteredActions.length > 0) {
            var sitesToFind = _.uniq(_.pluck(filteredActions, "to"));
            organization.find({"sites.identifier": {$in: sitesToFind}}, {
                "identifier": 1,
                "sites.identifier": 1
            }).lean().exec(function (err, siteData) {
                if (err)
                    reject(err);
                var actionsToInsert = [];
                for (var i = 0; i < filteredActions.length; i++) {
                    var siteExtraInfo = _.find(siteData, function (org) {
                        return _.findWhere(org.sites, {identifier: filteredActions[i].to}) != null;
                    });
                    if (siteExtraInfo) {
                        var action = {};

                        action.userIdentifier = userIdentifier;
                        action.organizationIdentifier = siteExtraInfo.identifier;
                        action.siteIdentifier = filteredActions[i].to;
                        action.date = new Date(filteredActions[i].at);
                        action.action = filteredActions[i].did;

                        actionsToInsert.push(action);
                    }

                }
                if (actionsToInsert.length == 0)
                    resolve();
                else
                    trackingSites.create(actionsToInsert, function (error) {
                        if (error)
                            reject(error);
                        resolve();
                    });
            });
        } else {
            resolve();
        }
    });
}

exports.getHistory = function (req, res) {
    var identifier = req.param('identifier');

    mobileHistory.findOne({identifier: identifier}, function (err, data) {
        if (err || !(data))
            res.json({status: "7", data: {}});
        else
            res.json({status: "0", data: data.actions});

    })
};

exports.setSiteRating = function (req, res) {
    var identifier = req.param("siteIdentifier");
    var biinieIdentifier = req.param("biinieIdentifier");
    var rating = req.param("rating");
    if (parseFloat(rating)) {
        var newRating = {};
        newRating.biinieIdentifier = biinieIdentifier;
        newRating.rating = parseFloat(rating);

        organization.update({"sites.identifier": identifier}, {$push: {"sites.$.rating": newRating}}, {upsert: true}, function (err, data) {
            if (err)
                res.json({data: {}, status: "7", result: "0"});
            else
                res.json({data: {}, status: "0", result: "1"});
        });
    }
    else {
        res.json({data: {}, status: "7", result: "0"});
    }
};

exports.setElementRating = function (req, res) {
    var identifier = req.param("elementIdentifier");
    var biinieIdentifier = req.param("biinieIdentifier");
    var rating = req.param("rating");
    if (parseFloat(rating)) {
        var newRating = {};
        newRating.biinieIdentifier = biinieIdentifier;
        newRating.rating = parseFloat(rating);

        organization.update({"elements.elementIdentifier": identifier}, {$push: {"elements.$.rating": newRating}}, {upsert: true}, function (err, data) {
            if (err)
                res.json({data: {}, status: "7", result: "0"});
            else
                res.json({data: {}, status: "0", result: "1"});
        });
    }
    else {
        res.json({data: {}, status: "7", result: "0"});
    }
};

//Map the Site information
function mapSiteMissingFields(biinieId, siteId, orgId, model, mobileUser, orgData, resultCallback) {
    var newModel = {};

    //Get the showcases available
    var getShowcasesWebAvailable = function (orgIdentifier, siteIdentifier, callback) {
        organization.findOne({identifier: orgIdentifier, 'sites.identifier': siteIdentifier}, {
            '_id': 0,
            'sites.$': 1
        }, function (err, data) {
            if (err)
                throw err;
            var showcases = [];
            var site = data.sites[0];
            var sitesIdentifier = _.pluck(site.showcases, 'showcaseIdentifier');

            if (site.showcases) {
                showcase.find({'identifier': {$in: sitesIdentifier}}, {
                    identifier: 1,
                    elements: 1
                }, function (err, foundShowcases) {
                    if (err)
                        throw err;
                    else {

                        for (var siteShowcase = 0; siteShowcase < sitesIdentifier.length; siteShowcase++) {

                            var highLighEl = [];
                            var showcaseInfo = _.findWhere(foundShowcases, {'identifier': sitesIdentifier[siteShowcase]});
                            var siteShowcaseInfo = _.findWhere(site.showcases, {'showcaseIdentifier': sitesIdentifier[siteShowcase]});
                            if (showcaseInfo) {
                                if (showcaseInfo && showcaseInfo.elements) {
                                    for (var el = 0; el < showcaseInfo.elements.length; el++) {
                                        if (showcaseInfo.elements[el].isHighlight == '1') {
                                            highLighEl.push({
                                                elementIdentifier: showcaseInfo.elements[el].elementIdentifier,
                                                showcase_id: siteShowcaseInfo._id
                                            });
                                        }
                                    }
                                }

                                showcases.push({
                                    '_id': showcaseInfo._id,
                                    'identifier': showcaseInfo.identifier,
                                    'highlightElements': highLighEl
                                });
                            }

                        }

                        /*
                         for(var showCaseInd=0;showCaseInd<foundShowcases.length;showCaseInd++){
                         var highLighEl =[];

                         for(var el =0 ;el<foundShowcases[showCaseInd].elements.length;el++){
                         if(foundShowcases[showCaseInd].elements[el].isHighlight=='1'){
                         highLighEl.push({elementIdentifier:foundShowcases[showCaseInd].elements[el].elementIdentifier});
                         }
                         }
                         showcases.push({'identifier':foundShowcases[showCaseInd].identifier,'highlightElements':highLighEl});
                         }*/
                        callback(showcases)
                    }

                });
            } else {
                callback(showcases)
            }
        });
    }

    //Get the biins available
    var getSiteBiins = function (siteIdentifier, callback) {

        biin.find({
            'siteIdentifier': siteIdentifier,
            'status': 'Installed',
            'objects.0': {$exists: true}
        }).lean().exec(function (err, biinsData) {
            if (err)
                throw err;
            else {
                var processedBiins = 0;

                if (biinsData.length === 0)
                    callback(biinsData);
                else {
                    for (var iBiin = 0; iBiin < biinsData.length; iBiin++) {

                        //Get the Biins Data
                        var getBiinsObjectsData = function (myIBiinIndex) {
                            biinBiinieObject.find({
                                'biinieIdentifier': biinieId,
                                'biinIdentifier': biinsData[myIBiinIndex].identifier
                            }, function (err, biinsObjects) {
                                var defaultCollection = 0;
                                if (err)
                                    throw err;
                                else {
                                    for (var o = 0; o < biinsData[myIBiinIndex].objects.length; o++) {

                                        var startTime = moment.tz(biinsData[myIBiinIndex].objects[o].startTime, 'America/Costa_Rica');
                                        var endtime = moment.tz(biinsData[myIBiinIndex].objects[o].endTime, 'America/Costa_Rica');

                                        var oData = null;
                                        if (biinsData[myIBiinIndex].objects)
                                            oData = _.findWhere(biinsObjects, {'identifier': biinsData[myIBiinIndex].objects[o].identifier});
                                        var el = null;
                                        if (mobileUser.biinieCollections && mobileUser.biinieCollections[defaultCollection] && mobileUser.biinieCollections[defaultCollection].elements)
                                            el = _.findWhere(mobileUser.biinieCollections[defaultCollection].elements, {identifier: biinsData[myIBiinIndex].objects[o].identifier})

                                        biinsData[myIBiinIndex].objects[o].isUserNotified = oData ? '1' : '0';
                                        biinsData[myIBiinIndex].objects[o].isBiined = el ? '1' : '0';

                                        //Time options
                                        biinsData[myIBiinIndex].objects[o].startTime = "" + (eval(startTime.hours()) + eval(startTime.minutes() / 60));
                                        biinsData[myIBiinIndex].objects[o].endTime = "" + (eval(endtime.hours()) + eval(endtime.minutes() / 60));

                                    }
                                    processedBiins++;

                                    //format the biins
                                    if (processedBiins == biinsData.length)
                                        callback(biinsData);
                                }
                            });
                        }

                        getBiinsObjectsData(iBiin);
                    }
                }
            }

        });
    }

    //Get the Neibors fo the site
    var getNeighbords = function (siteIdentifier, callback) {
        var neighbors = [];

        siteCategory.find({"sites.identifier": siteIdentifier}, {'sites.$': 1}, function (err, sitesCategoryFound) {
            if (err)
                throw err;
            else {
                //For each site categoy found
                for (var i = 0; i < sitesCategoryFound.length; i++) {
                    neighbors = _.union(neighbors, sitesCategoryFound[i].sites[0].neighbors);
                }
                var neighbors = _.uniq(neighbors, function (item, key, a) {
                    return item.siteIdentifier;
                });
                neighbors = _.sortBy(neighbors, 'proximity');
                callback(neighbors);
            }
        });
    }

    newModel.organizationIdentifier = orgId;
    newModel.proximityUUID = model.proximityUUID;
    newModel.identifier = model.identifier;
    newModel.major = "" + model.major;
    newModel.country = model.country;
    newModel.state = model.state;
    newModel.city = model.city;
    newModel.zipCode = model.zipCode;
    newModel.ubication = model.ubication;
    //Map fields;

    newModel.title = model.title1;
    newModel.subTitle = model.title2;
    newModel.titleColor = model.textColor.replace("rgb(", "").replace(")", "");
    newModel.zipCode = model.zipCode
    newModel.streetAddress1 = model.streetAddres ? model.streetAddres : "";
    newModel.latitude = "" + model.lat;
    newModel.longitude = "" + model.lng;
    newModel.biinedCount = model.biinedCount ? "" + model.biinedCount : "0";
    newModel.collectCount = "0";//model.biinedCount?""+model.biinedCount:"0";
    newModel.email = model.email ? model.email : "";
    newModel.nutshell = model.nutshell ? model.nutshell : "";
    newModel.phoneNumber = model.phoneNumber ? model.phoneNumber.trim().replace('-', '').replace('+', '') : "";

    var userbiined = _.findWhere(model.biinedUsers, {biinieIdentifier: biinieId});

    var userShare = _.findWhere(mobileUser.shareObjects, {identifier: siteId, type: "site"});


    var userCollected = _.findWhere(mobileUser.biinieCollections.sites, {identifier: siteId});
    var userFollowed = _.findWhere(mobileUser.followObjects, {identifier: siteId, type: "site"});
    var userLiked = _.findWhere(mobileUser.likeObjects, {identifier: siteId, type: "site"});

    var userComment = _.findWhere(model.userComments, {biinieIdentifier: biinieId});

    newModel.userBiined = typeof(userbiined) !== "undefined" ? "1" : "0";
    newModel.userShared = typeof(userShare) !== "undefined" ? "1" : "0";
    newModel.userFollowed = typeof(userFollowed) !== "undefined" ? "1" : "0";
    newModel.userCollected = typeof(userCollected) !== "undefined" ? "1" : "0";
    newModel.userLiked = typeof(userLiked) !== "undefined" ? "1" : "0";
    newModel.userCommented = typeof(userCommented) !== "undefined" ? "1" : "0";
    newModel.commentedCount = model.commentedCount ? "" + model.commentedCount : "0";

    var userRating = _.findWhere(model.rating, {biinieIdentifier: biinieId});
    newModel.userStars = typeof(userRating) !== "undefined" ? "" + userRating.rating : "0";
    var rating = 0;
    if (model.rating && model.rating.length > 0) {
        for (var i = model.rating.length - 1; i >= 0; i--) {
            rating += model.rating[i].rating;
        }
        ;
        rating = rating / model.rating.length;
    }
    newModel.stars = "" + rating;
    newModel.media = [];

    if (typeof(model.media) != 'undefined' && model.media.length > 0) {
        for (var i = 0; i < model.media.length; i++) {
            newModel.media[i] = {};
            newModel.media[i].domainColor = model.media[i].mainColor.replace("rgb(", "").replace(")");
            newModel.media[i].mediaType = "1";
            newModel.media[i].url = model.media[i].url;
            newModel.media[i].vibrantColor = model.media[i].vibrantColor ? model.media[i].vibrantColor : "0,0,0";
            newModel.media[i].vibrantDarkColor = model.media[i].vibrantDarkColor ? model.media[i].vibrantDarkColor : "0,0,0";
            newModel.media[i].vibrantLightColor = model.media[i].vibrantLightColor ? model.media[i].vibrantLightColor : "0,0,0";
        }
    }
    else {
        // Add default image
        newModel.media.push(SITE_DEFAULT_IMAGE);
    }

    //Get the asyc Information
    var showcaseReady = false;
    var biinsReady = false;
    var neighborsReady = false;

    //Get showcase available
    getShowcasesWebAvailable(orgId, siteId, function (showcases) {

        newModel.showcases = [];
        if (showcases)
            newModel.showcases = showcases;
        showcaseReady = true;

        if (showcaseReady && biinsReady && neighborsReady) {
            //Return the result callback
            resultCallback(newModel)
        }
    });

    //Get the Biins available
    getSiteBiins(siteId, function (biinsData) {
        newModel.biins = biinsData
        biinsReady = true;
        if (showcaseReady && biinsReady && neighborsReady) {
            //Return the result callback
            resultCallback(newModel)
        }
    });

    getNeighbords(siteId, function (siteNeibors) {
        newModel.neighbors = siteNeibors;
        neighborsReady = true;

        if (showcaseReady && biinsReady && neighborsReady) {
            //Return the result callback
            resultCallback(newModel)
        }
    });
}


exports.checkVersion = function (req, res) {
    var version = req.params["version"];
    var platform = req.params["platform"];
    var target = req.params["target"];

    var response = {};
    response.result = "1";
    response.status = "0";
    response.data = {};
    response.data.needsUpdate = "0";
    response.data.rootURL = "";


    switch (target) {
        case "dev":
            response.data.rootURL = "https://dev-biin-backend.herokuapp.com";
            break;
        case "qa":
            response.data.rootURL = "https://qa-biin-backend.herokuapp.com";
            break;
        case "demo":
            response.data.rootURL = "https://demo-biin-backend.herokuapp.com";
            break;
        case "prod":
            var versionPlatformConfig = versionsConfig[platform];
            if (versionPlatformConfig) {
                var versionStatus = versionPlatformConfig[version];
                if (versionStatus) {
                    if (versionStatus == "production" || versionStatus == "supported")
                        response.data.rootURL = "https://www.biin.io";
                    else if (versionStatus == "staging")
                        response.data.rootURL = "https://demo-biin-backend.herokuapp.com";
                    else if (versionStatus == "deprecated")
                        response.data.needsUpdate = "1";
                }
                else {
                    response.data.rootURL = "https://demo-biin-backend.herokuapp.com";
                }
            } else {
                response.data.rootURL = "https://demo-biin-backend.herokuapp.com";
            }
            break;
        default:
            response.data.rootURL = "https://demo-biin-backend.herokuapp.com";
            break;
    }

    res.json(response);

};

exports.registerForNotifications = function (req, res) {
    var biinieIdentifier = req.params.identifier;
    var platform = req.body.model.platform;
    var tokenId = req.body.model.tokenId;
    biinieDevice.findOneAndUpdate({biinieIdentifier: biinieIdentifier}, {
        $set: {
            biinieIdentifier: biinieIdentifier,
            deviceIdentifier: tokenId,
            platform: platform
        }
    }, {upsert: true}, function (err) {
        if (err) {
            res.send({result: 0, status: 1, data: {}});
        } else {
            res.send({result: 1, status: 0, data: {}});
        }
    });
};
