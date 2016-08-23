//Custom Utils
var utils = require('../utils.server.controller'),
    util = require('util'),
    math = require('mathjs'),
    _ = require('underscore');

//Schemas
var organization = require('../../models/organization'),
    site = require('../../models/site'),
    neighbour = require('../../models/neighbour'),
    biin = require('../../models/biin'),
    qrCodePerSite = require('../../models/qrCodePerSite');

var sysGlobalsRoutes = require('./globals.api.server.controller');

//GET the list of sites by organization Identifier
exports.getSitesList = function (req, res) {

    var callback = function (sites, req, res) {
        //Set the biin prototype
        var biinPrototype = new biin();
        biinPrototype.proximityUUID = req.param('identifier');

        res.json({data: sites, prototypeObj: new site(), prototypeObjBiin: biinPrototype});
    };

    getOganization(req, res, callback);
};

//PUT an update of an site
exports.setSites = function (req, res) {
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
exports.listSites = function (req, res) {
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
exports.markAsDeletedSites = function (req, res) {
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
exports.deleteSites = function (req, res) {
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

//Minor and major exports

//GET the major of the enviroment
var getMajor = function (organizationIdentifier, callback) {

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
exports.setSitesValid = function (req, res) {
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


exports.setNewSiteQRCode = function(req, res){
    var organizationIdentifier = req.params.orgIdentifier;
    var siteIdentifier = req.params.siteIdentifier;
    qrCodePerSite.update({siteIdentifier:siteIdentifier},{$set:{isActive:false}},{multi:true},function(err){
        if(err){
            res.status(500).json(err);
        } else {
            let newQR = new qrCodePerSite();
            newQR.siteIdentifier = siteIdentifier;
            newQR.save(function (err, newQR) {
               if(err){
                   res.status(500).json(err);
               } else {
                   res.json(newQR);
               }
            });
        }
    })

};

exports.getQRCode = function(req, res){
    var organizationIdentifier = req.params.orgIdentifier;
    var siteIdentifier = req.params.siteIdentifier;

    qrCodePerSite.findOne({siteIdentifier:siteIdentifier, isActive:true},{},function (err,qrCode) {
        if(err){
            res.status(500).json(err);
        } else {
            if(qrCode){
                res.json(qrCode);
            } else {
                res.status(200).json(null)
            }
        }
    })
};
