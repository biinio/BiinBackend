module.exports = function () {
    //Custom Utils
    var utils = require('../biin_modules/utils')();
    var util = require('util');

    //Schemas
    var organization = require('../schemas/organization');
    var biins = require('../schemas/biin'),
        site = require('../schemas/site');
    //var regionRoutes = require('./regions')();

    var siteRoutes = require('./sites')();
    var functions = {};

    //GET the main view of sites
    functions.index = function (req, res) {
        res.render('maintenance/index', {
            title: 'Maintenance',
            user: req.user,
            isSiteManteinance: true
        });
    }

    //GET the list of organizations
    functions.getOrganizationInformation = function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        organization.find({}, {
            _id: 0,
            identifier: 1,
            biinsAssignedCounter: 1,
            accountIdentifier: 1,
            name: 1,
            brand: 1,
            description: 1,
            extraInfo: 1,
            media: 1,
            biins: 1,
            biinsCounter: 1,
            majorCounter: 1,
            sites: 1,
            purchasedBiinsHist: 1
        }).lean().exec(function (err, data) {
            var organizations = data;
            res.json(organizations);
        });
    }

    //GET the list of beacon per organization
    functions.getBiinsOrganizationInformation = function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        var orgId = req.params['orgIdentifier'];
        biins.find({
            organizationIdentifier: orgId
        }, {
            _id: 0,
            identifier: 1,
            name: 1,
            major: 1,
            minor: 1,
            proximityUUID: 1,
            status: 1,
            isAssigned: 1,
            brandIdentifier: 1,
            organizationIdentifier: 1,
            siteIdentifier: 1,
            biinType: 1,
            venue: 1
        }).lean().exec(function (err, data) {
            var response = {};
            response.biins = data;
            response.defaultUUID = process.env.DEFAULT_SYS_ENVIROMENT;
            res.json(response);
        });
    }

    functions.addBiinToOrganizationModal = function (req, res) {
        res.render('maintenance/addBiinToOrganizationModal');
    }

    var biinCreate = function (req, res) {

    }

    functions.biinPurchase = function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        var beacon = req.body;


        var orgID = beacon.organizationIdentifier;
        var siteIndex = beacon.siteIndex;
        var siteLocationToUpdate = "sites." + siteIndex + ".minorCounter";
        delete beacon.siteIndex;
        var mode = beacon.mode;
        delete beacon.mode;

        var newMinor = beacon.siteMinor;
        delete beacon.siteMinor;

        var setQuery = {};
        var incQuery = {};
        setQuery[siteLocationToUpdate] = newMinor;

        var hasError = false;
        var errorMessage = "";
        var doneFunction = function () {
            if (hasError)
                return res.send('{"success":"false","message":"' + errorMessage + '"}', 500);
            else
                return res.send("{\"success\":\"true\"}", 200);

        };


        var createBeaconsFunction = function (beacon, incQuery, setQuery) {
            biins.create(beacon, function (error, data) {
                if (error == null) {
                    organization.update({identifier: orgID}, {
                        $inc: incQuery,
                        $set: setQuery
                    }, function (errorUpdate, raw) {
                        if (errorUpdate !== null)
                            hasError = true;
                        doneFunction();
                    });
                } else {
                    hasError = true;
                    if (error.code == 11000)
                        errorMessage = "Can't add a beacon with same ID";
                    else
                        errorMessage = "An unexpected error has been occurred";

                    doneFunction();
                }
            });
        };

        var updateBeaconFunction = function (beacon, incQuery, setQuery) {
            biins.update({identifier: beacon.identifier}, {$set: beacon}, function (error, raw) {
                if (error == null) {
                    organization.update({identifier: orgID}, {$set: setQuery}, function (errorUpdate, data) {
                        if (errorUpdate !== null)
                            hasError = true;
                        doneFunction();
                    });
                }
            });
        };

        if (mode == "create") {

            beacon.identifier = utils.getGUID();
            incQuery["biinsAssignedCounter"] = 1;
            incQuery["biinsCounter"] = 1;

            if (beacon.biinType == "1") {
                beacon.children = [];
                createBeaconsFunction(beacon, incQuery, setQuery);

            } else if (beacon.biinType == "2") {
                biins.find({
                    organizationIdentifier: orgID,
                    venue: "",
                    siteIdentifier: beacon.siteIdentifier,
                    biinType: "3"
                }, {_id: 0, minor: 1}).lean().exec(function (err, data) {
                    var children = [];
                    for (var i = 0; i < data.length; i++) {
                        children.push(data[i].minor)
                    }
                    beacon.children = children;
                    createBeaconsFunction(beacon, incQuery, setQuery);
                });
            } else if (beacon.biinType == "3") {
                biins.update({
                    organizationIdentifier: orgID,
                    venue: "",
                    siteIdentifier: beacon.siteIdentifier,
                    biinType: "2"
                }, {$push: {children: beacon.minor}}, {multi: true}).exec(function (err, raw) {
                    if (err) {
                        hasError = true;
                        doneFunction();
                    } else {
                        createBeaconsFunction(beacon, incQuery, setQuery);
                    }
                });
            }
        } else {
            if (beacon.biinType == "1") {
                beacon.children = [];
                //finding the old value of minor
                biins.findOne({identifier: beacon.identifier}, {_id: 0, minor: 1}, function (err, oldBeacon) {
                    if (err) {
                        hasError = true;
                        doneFunction();
                    } else {
                        var beaconMinor = oldBeacon.minor;
                        //remove from existing children in other beacons
                        biins.update({
                            organizationIdentifier: orgID,
                            venue: beacon.venue,
                            siteIdentifier: beacon.siteIdentifier,
                            biinType: "2",
                            children: {$in: [beaconMinor]}
                        }, {$pull: {children: beaconMinor}}, {multi: true}).exec(function (err, raw) {
                            if (err) {
                                hasError = true;
                                doneFunction();
                            } else {
                                updateBeaconFunction(beacon, incQuery, setQuery);
                            }
                        });
                    }
                });
            } else if (beacon.biinType == "2") {
                //find beacons who will be children of the new beacon
                biins.find({
                    organizationIdentifier: orgID,
                    venue: beacon.venue,
                    siteIdentifier: beacon.siteIdentifier,
                    biinType: "3",
                    minor: {$ne: beacon.minor}
                }, {_id: 0, minor: 1}).exec(function (err, data) {
                    if (err) {
                        hasError = true;
                        doneFunction();
                    } else {
                        var children = [];
                        for (var i = 0; i < data.length; i++) {
                            children.push(data[i].minor)
                        }
                        beacon.children = children;
                        //remove from existing children in other beacons
                        var beaconMinor = beacon.minor + "";
                        biins.update({
                            organizationIdentifier: orgID,
                            venue: beacon.venue,
                            siteIdentifier: beacon.siteIdentifier,
                            biinType: "2",
                            children: {$in: [beaconMinor]}
                        }, {$pull: {children: beaconMinor}}, {multi: true}).exec(function (err, raw) {
                            if (err) {
                                hasError = true;
                                doneFunction();
                            } else {
                                updateBeaconFunction(beacon, incQuery, setQuery);
                            }
                        });
                    }
                });

            } else if (beacon.biinType == "3") {
                var beaconMinor = beacon.minor + "";
                biins.update({
                    organizationIdentifier: orgID,
                    venue: beacon.venue,
                    siteIdentifier: beacon.siteIdentifier,
                    biinType: "2",
                    minor: {$ne: beacon.minor},
                    children: {$not: {$in: [beaconMinor]}}
                }, {$push: {children: beaconMinor}}, {multi: true}).exec(function (err, raw) {
                    if (err) {
                        hasError = true;
                        doneFunction();
                    } else {
                        beacon.children = [];
                        updateBeaconFunction(beacon, incQuery, setQuery);
                    }
                });

            }
        }
    };

    functions.getBeaconChildren = function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        biinType = req.headers['biintype'];
        biinvenue = req.headers['biinvenue'];
        siteId = req.headers['biinsite'];
        orgId = req.headers['biinorganization'];
        if (biinType == "2") {
            biins.find({
                organizationIdentifier: orgId,
                venue: biinvenue,
                siteIdentifier: siteId,
                biinType: "3"
            }, {
                _id: 0,
                minor: 1
            }).lean().exec(function (err, data) {
                var response = [];
                for (var i = 0; i < data.length; i++) {
                    response.push(data[i].minor)
                }
                res.json(response);
            });
        } else {
            res.json([]);
        }

    };

    return functions;
};