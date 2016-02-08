module.exports = function () {
    //Custom Utils
    var utils = require('../biin_modules/utils')(),
        util = require('util'),
        routesUtils = require('../biin_modules/routesUtils')(),
        math = require('mathjs'),
        _ = require('underscore');

    //Schemas
    var organization = require('../schemas/organization'),
        site = require('../schemas/site'),
        neighbour = require('../schemas/neighbour'),
        biin = require('../schemas/biin');

    var sysGlobalsRoutes = require('./sysGlobals')();
    var regionRoutes = require('../routes/regions')();

    var functions = {};

    //GET the main view of sites
    functions.index = function (req, res) {

        var callback = function (organization, req, res) {
            res.render('site/index', {
                title: 'Sites list',
                user: req.user,
                organization: organization,
                isSiteManteinance: true
            });
        };

        routesUtils.getOrganization(req.param("identifier"), req, res, {name: true, identifier: true}, callback)
    };

    functions.mapComponent = function (req, res) {
        res.render('site/_partials/mapComponent');
    };

    //GET the list of sites by organization Identifier
    functions.get = function (req, res) {

        var callback = function (sites, req, res) {
            //Set the biin prototype
            var biinPrototype = new biin();
            biinPrototype.proximityUUID = req.param('identifier');

            res.json({data: sites, prototypeObj: new site(), prototypeObjBiin: biinPrototype});
        };

        getOganization(req, res, callback);
    };

    //PUT an update of an site
    functions.set = function (req, res) {
        var model = req.body.model;
        //Perform an update
        var organizationIdentifier = req.param("orgIdentifier");
        res.setHeader('Content-Type', 'application/json');

        //If is pushing a new model
        if (typeof(req.param("siteIdentifier")) === "undefined") {

            //Set the account and the user identifier
            var model = new site();
            model.identifier = utils.getGUID();
            model.isValid = false;

            //Get the Mayor and Update
            getMajor(organizationIdentifier, function (major) {
                model.major = major;
                model.proximityUUID = process.env.DEFAULT_SYS_ENVIROMENT;
                organization.update(
                    {
                        identifier: organizationIdentifier
                    },
                    {
                        $push: {sites: model}
                    },
                    function (err, raw) {
                        if (err) {
                            res.send(err, 500);
                        }

                        else {
                            //Return the state and the object
                            res.send(model, 201);
                        }
                    }
                );
            });
        } else {
            var updateSite = false;

            var doneFunction = function () {
                //Return the state
                if (updateSite) {
                    console.log("Done process of: " + model.identifier);
                    res.send(model, 200);
                }

            };

            model.isValid = utils.validate(new site().validations(), req, 'model') == null;

            if (model) {
                delete model._id;
                delete model.minorCounter;
                delete model.major;
                delete model.isDeleted;
                delete model.commentedCount;
                delete model.sharedCount;
                delete model.biinedCount;
                delete model.loyalty;

                model.geoPosition = [parseFloat(model.lng), parseFloat(model.lat)];

                //Remove the id of the new biins
                for (var b = 0; b < model.biins.length; b++) {
                    if ('isNew' in model.biins[b]) {
                        delete model.biins[b]._id;
                    }
                }
                var set = {};

                for (var field in model) {
                    if (field != "biins")	//Add a filter for prevent insert other biins without purchase
                        set['sites.$.' + field] = model[field];
                }

                organization.update(
                    {identifier: organizationIdentifier, 'sites.identifier': model.identifier},
                    {$set: set},
                    {upsert: false},
                    function (err, raw) {
                        if (err) {
                            throw err;
                            res.json(null);
                        }
                        else {
                            updateSite = true;
                            updateNeighbour(model, function (result) {
                                doneFunction();
                            });

                        }
                    }
                );
            }
        }
    };

    //GET the list of sites which have not been marked as deleted
    functions.list = function (req, res) {
        var organizationIdentifier = req.param("identifier");
        organization.findOne({
            "identifier": organizationIdentifier
        }, {
            sites: true,
            name: true,
            identifier: true
        }, function (err, data) {
            //return only sites that have not been deleted.
            var siteList = [];
            for (var index = 0; index < data.sites.length; index++) {
                if (data.sites[index].isDeleted == 0) {
                    siteList.push(data.sites[index]);
                }
            }

            data.sites = siteList;
            var biinPrototype = new biin();
            biinPrototype.proximityUUID = req.param('identifier');

            res.json({data: data, prototypeObj: new site(), prototypeObjBiin: biinPrototype});
        });
    };

    //MARK site as deleted 
    functions.markAsDeleted = function (req, res) {
        //Perform an update
        var organizationIdentifier = req.param("orgIdentifier");
        var siteIdentifier = req.param("siteIdentifier");

        organization.update({
            identifier: organizationIdentifier,
            "sites.identifier": siteIdentifier
        }, {
            $set: {"sites.$.isDeleted": 1}
        }, function (err) {
            if (err) {
                throw err;
            }
            else {
                res.json({state: "success"});
            }
        });
    };

    //DELETE an specific site from DB
    functions.delete = function (req, res) {
        //Perform an update
        var organizationIdentifier = req.param("orgIdentifier");
        var siteIdentifier = req.param("siteIdentifier");

        regionRoutes.removeSiteToRegionBySite(siteIdentifier, function () {
            organization.update({identifier: organizationIdentifier}, {$pull: {sites: {identifier: siteIdentifier}}}, function (err) {
                if (err)
                    throw err;
                else
                    siteCategory.update({"sites.identifier": siteIdentifier}, {$pull: {"sites": {'identifier': siteIdentifier}}}, {multi: true}, function (err, raw) {
                        if (err)
                            throw err;
                        else {
                            res.json({state: "success"});
                        }
                    });
            });
        });
    };

    //PUT Purchase a Biin to a Site
    functions.biinPurchase = function (req, res) {
        var organizationIdentifier = req.param("orgIdentifier");
        var siteIdentifier = req.param("siteIdentifier");
        var qty = eval(req.body['biinsQty']);
        var isBasicPackage = eval(req.body['isBasicPackage']);
        if (isBasicPackage)
            qty = 2;
        res.setHeader('Content-Type', 'application/json');

        if ((qty || isBasicPackage) && organizationIdentifier && siteIdentifier) {
            var newMinorValue = utils.get.minorIncrement() * qty;
            organization.findOne({identifier: organizationIdentifier, 'sites.identifier': siteIdentifier}, {
                '_id': 1,
                'sites.$': 1
            }, function (err, siteInfo) {
                if (err)
                    res.send(err, 500);
                else {
                    var minor = 0;
                    var major = 0;
                    if (siteInfo.sites[0]) {
                        minor = siteInfo.sites[0].minorCounter;
                        major = siteInfo.sites[0].major;
                    }

                    //Todo the process of the deduction of the Credit Card
                    var historyRecord = {};
                    historyRecord.date = utils.getDateNow();
                    historyRecord.quantity = qty;
                    historyRecord.site = siteIdentifier;

                    //Add an history record
                    organization.update({identifier: organizationIdentifier}, {$push: {purchasedBiinsHist: {$each: [historyRecord]}}}, {upsert: false}, function (err, raw) {
                        if (err) {
                            res.send(err, 500)
                        } else {
                            newMinorValue += eval(minor);
                            var newBeacons = [];
                            var dateNow = utils.getDateNow();
                            var cantMinorToInc = utils.get.minorIncrement();
                            var minorIncrement = minor;

                            //Create the new Beacons
                            for (var i = 0; i < qty; i++) {
                                var biinIdentifier = utils.getGUID();
                                minorIncrement += cantMinorToInc;
                                var biintype = 1;
                                if (isBasicPackage)
                                    biintype = (i % 2) + 1;
                                newBeacons.push(new biin({
                                    identifier: biinIdentifier,
                                    registerDate: dateNow,
                                    proximityUUID: organizationIdentifier,
                                    major: major,
                                    minor: minorIncrement,
                                    isRequiredBiin: isBasicPackage,
                                    biinType: biintype
                                }));
                            }
                            newMinorValue = 0;
                            //Organization Update
                            organization.update({
                                '_id': siteInfo._id,
                                "sites._id": siteInfo.sites[0]._id
                            }, {
                                $push: {"sites.$.biins": {$each: newBeacons}},
                                $set: {"sites.$.minorCounter": newMinorValue}
                            }, function (err, raw) {
                                if (err)
                                    res.send(err, 500);
                                else {
                                    res.send(newBeacons, 201);
                                }
                            });
                        }

                    });
                }

            });

        }
    };

    //Post add Site to a region
    functions.addSiteToRegion = function (req, res) {
        var orgIdentifier = req.param('orgIdentifier');
        var siteIdentifier = req.param('siteIdentifier')

        var addSiteLogic = function (siteObj) {
            addSiteToRegion(siteObj, function (result, regionId) {
                if (result) {
                    organization.update({
                        'identifier': orgIdentifier,
                        'sites.identifier': siteObj.identifier
                    }, {$set: {'sites.$.region': regionId}}, function (err, raw) {
                        if (!err && raw.n > 0)
                            res.json({status: 0, data: regionId})
                        else
                            res.json({status: 5})
                    });


                } else {
                    res.json({status: 5})
                }

            })
        };

        organization.findOne({
            identifier: orgIdentifier,
            "sites.identifier": siteIdentifier
        }, {"sites.$": 1}, function (err, foundSite) {
            if (err)
                throw err;
            else {
                if (foundSite && foundSite.sites) {
                    if (foundSite.sites[0].region === '') {
                        addSiteLogic(foundSite.sites[0])
                    } else {
                        console.log("Updating the site region");
                        //Unsubscribe the site to the region
                        regionRoutes.removeSiteToRegionBySite(siteIdentifier, function () {
                            addSiteLogic(foundSite.sites[0]);
                        })
                    }
                }
            }
        })
    };

    //Function to add a site inside a region.
    addSiteToRegion = function (site, callback) {

        //Verify the  closest region
        regionRoutes.getRegionByProximity(site.lat, site.lng, function (isInside, region) {
            //If is inside a region
            if (isInside) {
                regionRoutes.addSiteToRegion(region.identifier, {identifier: site.identifier}, function (wasAdded, regionId) {
                    if (wasAdded) {
                        callback(true, region.identifier);
                    }
                    else {
                        callback(false, null);
                    }
                });
            } else {
                //If is not inside a region
                regionRoutes.createRegion(site.lat, site.lng, {identifier: site.identifier}, function (wasAdded, region) {
                    if (wasAdded) {
                        callback(true, region);
                    } else {
                        callback(false, null);
                    }
                })
            }


        });
    };

    //Minor and major Functions

    //GET the major of the enviroment
    getMajor = function (organizationIdentifier, callback) {

        //Get the mayor from the enviroment	and return it
        //TODO: Get enviroment by Site configuration
        var enviroment = process.env.DEFAULT_SYS_ENVIROMENT;

        sysGlobalsRoutes.incrementMajor(enviroment, function (major) {
            callback(major);
        })
    };

    function updateNeighbour(model, callback) {
        var MAX_NEIGHBOURS = 5;

        objectToSave = {};
        objectToSave.siteIdentifier = model.identifier;
        objectToSave.neighbours = [];
        objectToSave.geoPosition = model.geoPosition;

        neighbour.update(
            {siteIdentifier: model.identifier},
            {$set: objectToSave},
            {upsert: true},
            function (errUpdate, data) {
                if (errUpdate) {
                    callback(false);
                } else {
                    neighbour.find({}, {}).lean().exec(function (err, data) {
                        var savePromise = [];
                        for (var i = 0; i < data.length; i++) {
                            for (var j = 0; j < data.length; j++) {
                                data[j].proximity = utils.getProximity(data[i].geoPosition[1], data[i].geoPosition[0], data[j].geoPosition[1], data[j].geoPosition[0]);
                            }
                            var sortedData = _.sortBy(data, function (site) {
                                return site.proximity;
                            });

                            var neighbours = sortedData.splice(0, MAX_NEIGHBOURS);
                            var neighboursID = _.pluck(neighbours, "siteIdentifier");
                            neighboursID.shift();
                            data[i].neighbours = neighboursID;
                            savePromise.push(neighbour.update({"siteIdentifier": data[i].siteIdentifier}, {$set: {"neighbours": data[i].neighbours}}));
                        }
                        Promise.all(savePromise).then(function () {
                            callback(true);
                        }, function () {
                            callback(false);
                        });
                    });
                }
            });
    }

    //Test and other Utils
    functions.setSitesValid = function (req, res) {
        var processed = 0;
        organization.find({'sites.isValid': {$exists: false}}, {"identifier": 1, "sites": 1}, function (err, data) {
            var orgCant = data.length;
            for (var o = 0; o < data.length; o++) {
                var organization = data[o];
                for (var s = 0; s < data[o].sites.length; s++) {
                    req.body.model = organization.sites[s];
                    var errors = utils.validate(new site().validations(), req, 'model');
                    console.log(errors);
                    data[o].sites.isValid = errors === null;
                    console.log('Is site valid: ' + data[o].sites.isValid);
                }

                organization.save(function (err) {
                    processed++;
                    if (err)
                        throw err;
                    else
                        console.log("save changes in org: " + organization.identifier);

                    if (processed === orgCant)
                        res.json({status: 0});
                })
            }

        })
    };

    return functions;
};
