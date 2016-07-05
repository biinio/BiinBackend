module.exports = function () {

    //Common Libraries
    var util = require('util'),
        fs = require('fs');

    //Custom Utils
    var utils = require('../biin_modules/utils')(),
        path = require('path'),
        imageManager = require('../biin_modules/imageManager')();
    var gm = require("gm"), imageMagick = gm.subClass({imageMagick: true});
    var Vibrant = require('node-vibrant');
    //Schemas
    var organization = require('../schemas/organization'),
        showcase = require('../schemas/showcase'),
        client = require('../schemas/client');

    //Other Routes
    var regionRoutes = require('./regions')();

    var functions = {},
        _workingImagePath = './public/workingFiles/';

    //GET the Main view of an Organization
    functions.index = function (req, res) {
        res.render('organization/index', {
            title: 'Organizations list',
            user: req.user
        });
    };

    //GET the list of organizations
    functions.list = function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        var accountIdentifier  = req.headers.user;
        organization.find({
            "accountIdentifier": accountIdentifier,
            "isDeleted": false
        }, {
            _id: 0,
            identifier: 1,
            name: 1,
            brand: 1,
            description: 1,
            extraInfo: 1,
            media: 1,
            loyaltyEnabled: 1,
            sites: 1,
            isPublished: 1,
            hasNPS: 1,
            isUsingBrandColors: 1,
            primaryColor: 1,
            secondaryColor: 1

        }).lean().exec(function (err, data) {
            if (err) {
                throw err
            }
            else {
                for (var i = 0; i < data.length; i++) {

                    if (!data[i].isUsingBrandColors) {
                        data[i].isUsingBrandColors = "0";
                    }

                    if (!data[i].primaryColor) {
                        data[i].primaryColor = "rgb(170,171,171)";
                    } else {
                        data[i].primaryColor = "rgb(" + data[i].primaryColor + ")";
                    }

                    if (!data[i].secondaryColor) {
                        data[i].secondaryColor = "rgb(85,86,86)";
                    } else {
                        data[i].secondaryColor = "rgb(" + data[i].secondaryColor + ")";
                    }

                }
                res.json({data: data});
            }
        });
    };

    //PUT/POST an organization
    functions.set = function (req, res) {
        //Perform an update
        var organizationIdentifier = req.param("identifier");
        res.setHeader('Content-Type', 'application/json');
        var model = req.body.model;

        delete model._id;
        delete model.identifier;
        delete model.accountIdentifier;

        if (!model.isUsingBrandColors) {
            model.isUsingBrandColors = "0";
        }

        if (!model.primaryColor) {
            model.primaryColor = "170,171,171";
        } else {
            model.primaryColor = model.primaryColor.replace("rgb(", "").replace(")", "");
        }

        if (!model.secondaryColor) {
            model.secondaryColor = "85,86,86";
        } else {
            model.secondaryColor = model.secondaryColor.replace("rgb(", "").replace(")", "");
        }

        organization.update({
                identifier: organizationIdentifier
            }, {
                $set: model
            }, {
                upsert: false
            },
            function (err) {
                if (err)
                    res.send(err, 500);
                else
                //Return the state
                    res.send(model, 200);
            }
        );
    };

    //PUT an organization
    functions.create = function (req, res) {
        //Perform an update
        var accountIdentifier = req.param("accountIdentifier");
        res.setHeader('Content-Type', 'application/json');
        var newModel = new organization();
        newModel.accountIdentifier = accountIdentifier;
        newModel.identifier = utils.getGUID();
        newModel.primaryColor = "170,171,171";
        newModel.secondaryColor = "85,86,86";
        //Perform an create
        newModel.save(function (err) {
            if (err)
                res.send(err, 500);
            else {
                newModel.primaryColor = "rgb(170,171,171)";
                newModel.secondaryColor = "rgb(85,86,86)";
                //Return the state and the object
                res.send(newModel, 201);
            }
        });
    };

    //Set showcases into sites in a organization
    functions.setShowcasesPerSite = function (req, res) {
        var organizationIdentifier = req.param("identifier");
        var model = req.body.model;

        organization.findOne({
            identifier: organizationIdentifier
        }, {
            _id: true,
            'sites': true
        }, function (err, data) {

            // Find the correct site to assign the showcase to
            for (var index = 0; index < model.sites.length; index++) {
                for (var j = 0; j < data.sites.length; j++) {
                    if (model.sites[index].identifier == data.sites[j].identifier) {
                        data.sites[j].showcases = model.sites[index].showcases;
                        break;
                    }
                }
            }

            data.save(
                function (err, organization) {
                    if (err)
                        res.send(err, 500);
                    else
                        res.send(organization, 200);
                })
        });
    };

    functions.getSelectedOrganization = function (req, res) {
        var aIdentifier = req.param("accountIdentifier");

        client.findOne({
            accountIdentifier: aIdentifier
        }, {
            _id: true,
            'selectedOrganization': true
        }, function (err, data) {
            res.json({
                data: data
            });
        });
    };

    //Save selected organization to client table
    functions.saveSelectedOrganization = function (req, res) {
        var aIdentifier = req.param("accountIdentifier");
        var oIdentifier = req.param("organizationIdentifier");

        client.update({
            accountIdentifier: aIdentifier
        }, {
            selectedOrganization: oIdentifier
        }, function (err, data) {

            if (err)
                throw err;
            else
                res.json({
                    state: "success"
                });
        });


    };

    //Test Vibrant
    functions.testVibrant = function (req, res) {
        //mueble: var file = 'http://i.imgur.com/7AQUAab.jpg';
        //zapato: var file = 'http://i.imgur.com/jbbXTUB.jpg';
        var file = 'http://i.imgur.com/miZt94c.jpg';
        var opts = {};
        opts.quality = 5;
        var vibrant = new Vibrant(file);
        var result = {};
        vibrant.getSwatches(function (error, swatches) {
            var mainColorRGB = swatches.Vibrant ? swatches.Vibrant.rgb : [0, 0, 0];
            var darkVibrantRGB = swatches.DarkVibrant ? swatches.DarkVibrant.rgb : [0, 0, 0];
            var lightVibrantRGB = swatches.LightVibrant ? swatches.LightVibrant.rgb : [255, 255, 255];

            result.main = mainColorRGB;
            result.dark = darkVibrantRGB;
            result.light = lightVibrantRGB;
            res.json(result);
        });
    };


    //Post the Image of the Organization
    functions.uploadImage = function (req, res) {
        //Read the file
        var organizationIdentifier = req.param("identifier");
        res.setHeader('Content-Type', 'application/json');
        var userAccount = req.headers["accountidentifier"];
        if (!util.isArray(req.files.file)) {

            var file = req.files.file;
            var imagesDirectory = userAccount;
            var systemImageName = 'media/' + userAccount + "/" + organizationIdentifier + "/media/" + utils.getGUID() + "." + utils.getExtension(file.originalFilename);
            imageManager.uploadFile(file.path, imagesDirectory, systemImageName, false, function (url) {
                var mediaObj = {
                    url: url
                };

                var tempId = utils.getUIDByLen(40) + ".";

                imageMagick(file.path).format(function (err, format) {

                    var tempPath = _workingImagePath + tempId + format;

                    imageMagick(file.path).size(function (err, size) {

                        imageMagick(file.path)
                            .depth(8, function (err, data) {
                                if (err)
                                    console.log(err);
                            })
                            .write(tempPath, function (err, data) {
                                var vibrant = new Vibrant(tempPath);
                                vibrant.getSwatches(function (error, swatches) {
                                    var mainColorRGB = swatches.Vibrant ? swatches.Vibrant.rgb : [0, 0, 0];
                                    var darkVibrantRGB = swatches.DarkVibrant ? swatches.DarkVibrant.rgb : [0, 0, 0];
                                    var lightVibrantRGB = swatches.LightVibrant ? swatches.LightVibrant.rgb : [255, 255, 255];

                                    mainColor = "" + parseInt(mainColorRGB[0]) + "," + parseInt(mainColorRGB[1]) + "," + parseInt(mainColorRGB[2]);
                                    var vibrantColor = mainColor;
                                    var darkVibrantColor = "" + parseInt(darkVibrantRGB[0]) + "," + parseInt(darkVibrantRGB[1]) + "," + parseInt(darkVibrantRGB[2]);
                                    var lightVibrantColor = "" + parseInt(lightVibrantRGB[0]) + "," + parseInt(lightVibrantRGB[1]) + "," + parseInt(lightVibrantRGB[2]);


                                    if (fs.existsSync(tempPath)) {
                                        fs.unlink(tempPath, function (err) {
                                            console.log("The image was removed succesfully");
                                        });
                                    }

                                    mediaObj.mainColor = mainColor;
                                    mediaObj.vibrantColor = vibrantColor;
                                    mediaObj.vibrantDarkColor = darkVibrantColor;
                                    mediaObj.vibrantLightColor = lightVibrantColor;

                                    organization.update({
                                        identifier: organizationIdentifier
                                    }, {
                                        media: mediaObj
                                    }, function (err) {
                                        if (err)
                                            res.send(err, 500);
                                        else {
                                            res.json({
                                                data: mediaObj
                                            });
                                        }
                                    });
                                })
                            })
                    });
                });

            });

        } else {
            res.send(err, 500);
        }
    };


    //Mark an organization, and its showcases as deleted
    functions.markAsDeleted = function (req, res) {
        //Get the organization identifier
        var organizationIdentifier = req.param("identifier");
        organization.update({
            identifier: organizationIdentifier
        }, {
            $set: {"isDeleted": 1}
        }, function (err) {
            if (err) {
                throw err;
            }
            else {
                showcase.update({
                    'organizationIdentifier': organizationIdentifier
                }, {
                    $set: {"isDeleted": 1}
                }, function (err) {
                    if (err) {
                        throw err;
                    }
                    else {
                        res.json({state: "success"});
                    }
                });
            }
        });
    };


    //DELETE an specific Organization
    functions.delete = function (req, res) {

        //Get the organization identifier
        var organizationIdentifier = req.param("identifier");

        organization.findOne({
            identifier: organizationIdentifier
        }, function (err, data) {
            //Remove Sites and References
            for (var s = 0; s < data.sites.length; s++) {
                var removeSite = regionRoutes.removeSiteToRegionBySite(data.sites[s].identifier, function () {
                });
            }


            //Remove the showcases references
            showcase.remove({
                'organizationIdentifier': organizationIdentifier
            }, function (err, affected) {
                if (err)
                    throw err;
                else {
                    //Remove the organization
                    organization.remove({
                        identifier: organizationIdentifier
                    }, function (err) {
                        if (err)
                            throw err;
                        else
                            res.json({
                                state: "success"
                            });
                    });
                }
            });


        });
    };

    // Check if gallery image is being used before deleting
    functions.checkImageUse = function (req, res) {
        var organizationIdentifier = req.param('identifier');
        var imageIdentifier = req.param('imageIdentifier');

        organization.findOne({
            identifier: organizationIdentifier,
            "isDeleted": false
        }, {
            _id: true,
            'sites._id': true,
            'sites.media': true,
            'sites.isDeleted': true,
            'elements._id': true,
            'elements.media': true,
            'elements.isDeleted': true
        }, function (err, data) {
            if (err) {
                throw err;
            }
            else {
                var imageInUse = false;

                for (var elementIndex = 0; elementIndex < data.elements.length; elementIndex++) {
                    // Check elements that have not been deleted
                    if (data.elements[elementIndex].isDeleted == false) {
                        // Check media from the element to see if image is being used
                        for (image = 0; image < data.elements[elementIndex].media.length; image++) {
                            if (data.elements[elementIndex].media[image].identifier == imageIdentifier) {
                                imageInUse = true;
                            }
                        }
                    }
                }

                // Check that it is not being used in sites if it's not being used in elements
                if (imageInUse == false) {
                    for (var siteIndex = 0; siteIndex < data.sites.length; siteIndex++) {

                        //Check on sites that have not been deleted
                        if (data.sites[siteIndex].isDeleted == false) {
                            for (imageIndex = 0; imageIndex < data.sites[siteIndex].media.length; imageIndex++) {
                                if (data.sites[siteIndex].media[imageIndex].identifier == imageIdentifier) {
                                    imageInUse = true;
                                }
                            }
                        }
                    }
                }

                // Image still not in use, proceed to delete
                if (imageInUse == false) {
                    //remove elements from organization.elements
                    organization.update({
                        identifier: organizationIdentifier
                    }, {
                        $pull: {gallery: {identifier: imageIdentifier}}
                    }, {
                        multi: true
                    }, function (err) {
                        if (err)
                            throw err;
                        else {
                            res.json({
                                deleted: true
                            });
                        }
                    });
                }
                else {

                    res.json({
                        deleted: imageInUse
                    });
                }
            }
        });
    };

    //Delete gallery images
    functions.deleteImage = function (req, res) {
        var organizationIdentifier = req.param('identifier');
        var imageIdentifier = req.param('imageIdentifier');

        //remove elements from organization.elements
        organization.update({
            identifier: organizationIdentifier
        }, {
            $pull: {gallery: {identifier: imageIdentifier}}
        }, {
            multi: true
        }, function (err) {
            if (err)
                throw err;
            else {
                res.json({
                    state: "success"
                });
            }
        });

    };

    //Minor and major Functions

    //GET the minor of the organization context
    functions.getMinor = function (req, res) {
        var organizationIdentifier = req.param('identifier');
        var siteIdentifier = req.param('siteIdentifier');
        organization.findOne({
            identifier: organizationIdentifier,
            'sites.identifier': siteIdentifier
        }, 'sites.$.minorCounter', function (err, data) {
            //If the site is not new
            if (data) {
                organization.update({
                    identifier: organizationIdentifier,
                    'sites.identifier': siteIdentifier
                }, {
                    $inc: {
                        'sites.$.minorCounter': utils.get.minorIncrement()
                    }
                }, function (err, raw) {
                    if (err)
                        throw err;
                    else {

                        var minor = 0;
                        if (data.sites[0].minorCounter)
                            minor = data.sites[0].minorCounter;

                        res.json({
                            data: minor
                        });
                    }
                });
            } else
            //Return the increment variable
                res.json({
                    data: utils.get.minorIncrement()
                });
        });
    };

    return functions;
};
