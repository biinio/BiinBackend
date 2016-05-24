module.exports = function () {

    var _ = require('underscore');
    var fs = require('fs');

    //Schemas
    var mobileUser = require('../schemas/mobileUser'),
        util = require('util'),
        bcrypt = require('bcrypt'),
        imageManager = require('../biin_modules/imageManager')(),
        category = require('../schemas/category'),
        utils = require("../biin_modules/utils")();
    var organization = require('../schemas/organization');

    // Default image for organizations
    var ORGANIZATION_DEFAULT_IMAGE = {
        domainColor: '170, 171, 171',
        mediaType: '1',
        title1: 'default',
        url: 'https://biinapp.blob.core.windows.net/biinmedia/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/media/cb8b7da3-dfdf-4ae0-9291-1f60eb386c43/4e8b2fb3-af89-461d-9c37-2cc667c20653/media/4af24d51-2173-4d41-b651-d82f18f00d1b.jpg',
        vibrantColor: '170, 171, 171',
        vibrantDarkColor: '85,86,86',
        vibrantLightColor: '170, 171, 171'
    };

    var functions = {};

    //GET the Main view of an Binnies
    functions.index = function (req, res) {
        res.render('binnie/index', {title: 'Binnies list', user: req.user, organization: null});
    };

    //Get the list of Binnies
    functions.get = function (req, res) {
        var prototype = new mobileUser();

        res.setHeader('Content-Type', 'application/json');
        mobileUser.find({}, function (err, binnies) {
            if (err)
                res.send(500);
            else
                res.json({data: binnies, prototype: prototype});
        });
    };

    //Get the profile of a biinnie
    functions.getProfile = function (req, res) {
        var identifier = req.params.identifier;
        //Find the mobile user
        mobileUser.findOne({'identifier': identifier}, {
            "identifier": 1,
            "email": 1,
            "biinName": 1,
            "firstName": 1,
            "birthDate": 1,
            "accountState": 1,
            "gender": 1,
            "lastName": 1,
            "url": 1,
            "friends": 1,
            "biins": 1,
            "following": 1,
            "followers": 1,
            "categories": 1,
            "facebookId": 1,
            "facebookAvatarUrl":1,
            "facebookFriends":1
        }, function (err, foundBinnie) {
            if (err)
                res.json({data: {}, status: "5", result: "0"});
            else {
                var isFound = typeof(foundBinnie) !== 'undefined' && foundBinnie !== null;
                if (!isFound)
                    res.json({data: {}, status: "7", result: "0"});
                else {
                    var result = foundBinnie.toObject();
                    result.birthDate = foundBinnie.birthDate.replace("T", " ").replace("Z", "");
                    result.isEmailVerified = foundBinnie.accountState ? "1" : "0";
                    result.facebook_id = foundBinnie.facebookId || "";
                    result.facebookAvatarUrl = foundBinnie.facebookAvatarUrl || "";
                    result.facebookFriends = foundBinnie.facebookFriends || [];
                    delete result.facebookId;
                    delete result.accountState;
                    res.json({data: result, status: "0", result: "1"});
                }
            }
        });
    };

    //Get The Biinie Biined Collections
    functions.getCollections = function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        var identifier = req.params.identifier;
        mobileUser.findOne({"identifier": identifier}, {_id: 0, biinieCollections: 1}, function (err, data) {
            if (err)
                res.json({data: {}, status: "5", result: "0"});
            else if (data != null && data.biinieCollections != null && data.biinieCollections.length > 0) {
                res.json({data: {biinieCollections: data.biinieCollections}, status: "1", result: "1"});
            } else {
                res.json({data: {}, status: "9", result: "0"});
            }
        });
    };

    //GET the Organization information and biinie info
    functions.getOrganizationInformation = function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        var identifier = req.params.identifier;
        var organizationId = req.params.organizationIdentifier;
        mobileUser.findOne({"identifier": identifier}, {_id: 0, loyalty: 1}, function (err, mobileUserFound) {
            if (err)
                res.json({data: {}, status: "5", result: "0"});
            else {
                organization.findOne({'identifier': organizationId}, {
                    'name': 1,
                    'brand': 1,
                    'description': 1,
                    'extraInfo': 1,
                    'media': 1,
                    'loyaltyEnabled': 1
                }).lean().exec(function (err, org) {
                    if (err)
                        throw err;
                    else {
                        var loyaltyModel = {
                            isSubscribed: "1",
                            subscriptionDate: utils.getDateNow(),
                            points: "0",
                            level: "0",
                            achievements: [],
                            badges: []
                        };
                        if ('loyalty' in mobileUserFound) {
                            var loyaltyToFind = _.findWhere(mobileUserFound.loyalty, {organizationIdentifier: organizationId});
                            if (typeof(loyaltyToFind) !== 'undefined')
                                loyaltyModel = loyaltyToFind;
                        }
                        org.isLoyaltyEnabled = org.loyaltyEnabled ? org.loyaltyEnabled : "0";
                        if (org.loyaltyEnabled)
                            delete org.loyaltyEnabled;
                        org.loyalty = loyaltyModel;
                        //var loyalty = loyaltyModel;

                        if (typeof(org.media) != 'undefined') {
                            if (typeof(org.media) == "object" && !Array.isArray(org.media)) {
                                var newMedia = [];
                                newMedia[0] = {};
                                newMedia[0].domainColor = org.media.mainColor ? org.media.mainColor.replace("rgb(", "").replace(")") : "0,0,0";
                                newMedia[0].mediaType = "1";
                                newMedia[0].title1 = "";
                                newMedia[0].url = org.media.url;
                                newMedia[0].vibrantColor = org.media.vibrantColor ? org.media.vibrantColor : "0,0,0";
                                newMedia[0].vibrantDarkColor = org.media.vibrantDarkColor ? org.media.vibrantDarkColor : "0,0,0";
                                newMedia[0].vibrantLightColor = org.media.vibrantLightColor ? org.media.vibrantLightColor : "0,0,0";
                            }
                            else if (Array.isArray(org.media)) {

                                var newMedia = [];
                                if (org.media.length == 0) {
                                    newMedia.push(ORGANIZATION_DEFAULT_IMAGE);
                                }

                                for (var i = 0; i < org.media.length; i++) {
                                    newMedia[i] = {};
                                    newMedia[i].domainColor = org.media[i].mainColor ? org.media[i].mainColor.replace("rgb(", "").replace(")") : "0,0,0";
                                    newMedia[i].mediaType = "1";
                                    newMedia[i].title1 = "";
                                    newMedia[i].url = org.media[i].url;
                                    newMedia[i].vibrantColor = org.media[i].vibrantColor ? org.media[i].vibrantColor : "0,0,0";
                                    newMedia[i].vibrantDarkColor = org.media[i].vibrantDarkColor ? org.media[i].vibrantDarkColor : "0,0,0";
                                    newMedia[i].vibrantLightColor = org.media[i].vibrantLightColor ? org.media[i].vibrantLightColor : "0,0,0";
                                }
                            }
                            org.media = newMedia;
                        }
                        res.json({data: {organization: org}, status: "0", result: "1"});
                    }
                })
            }
        });
    };

    //PUT a new Mobile User
    functions.set = function (req, res) {

        res.setHeader('Content-Type', 'application/json');
        var model = req.body['model'],
            joinDate = utils.getDateNow(),
            accountState = 'active';

        if ('isNew' in model) {

            mobileUser.findOne({'biinName': model.biinName}, function (err, mobileUserAccount) {
                if (mobileUserAccount) {
                    res.send('The Account Name is already taken');
                } else {
                    bcrypt.hash(model.password, 11, function (err, hash) {

                        var newModel = new mobileUser({
                            identifier: utils.getGUID(),
                            firstName: model.firstName,
                            lastName: model.lastName,
                            biinName: model.biinName,
                            password: hash,
                            tempPassword: model.password,
                            birthDate: model.birthDate ? model.birthDate : "",
                            gender: model.gender ? model.gender : "",
                            joinDate: joinDate,
                            accountState: accountState,
                            comments: model.comments ? model.comments : "",
                            userBiined: model.userBiined ? model.userBiined : "",
                            userCommented: model.userCommented ? model.userCommented : "",
                            userShared: model.userShared ? model.userShared : "",
                            categories: model.categories ? model.categories : [],
                            url: model.url ? model.url : ""
                        });

                        //Save The Model
                        newModel.save(function (err) {
                            if (err)
                                throw err;
                            else
                                res.send(201);
                        });
                    });
                }
            });
        } else {//Update the Binnie information profile
            mobileUser.update(
                {'identifier': model.identifier},
                {
                    firstName: model.firstName,
                    lastName: model.lastName,
                    birthDate: model.birthDate ? model.birthDate : "",
                    gender: model.gender ? model.gender : "",
                    comments: model.comments ? model.comments : "",
                    userBiined: model.userBiined ? model.comments : "",
                    userCommented: model.userCommented ? model.userCommented : "",
                    userShared: model.userShared ? model.userShared : "",
                    categories: model.categories ? model.categories : [],
                    url: model.url ? model.url : ""
                },
                function (err, raw) {
                    if (err)
                        res.send(err, 500);
                    else
                        res.send(201)
                }
            );
        }
        /*
         var errors = null;//utils.validate(new mobileUser().validations(),req,'');
         if (errors) {
         res.send(errors, 400)
         } else {

         }	*/
    }

    //POST the Categories of an Mobile User
    functions.setCategories = function (req, res) {
        var identifier = req.params.identifier;
        res.setHeader('Content-Type', 'application/json');

        var categoriesModel = req.body['model'];

        var catArray = _.pluck(categoriesModel, 'identifier')
        category.find({'identifier': {$in: catArray}}, function (err, data) {
            if (err)
                res.json({data: {}, status: "5", result: "0"});
            else {
                mobileUser.update({'identifier': identifier}, {categories: data}, function (err, raw) {
                    if (err)
                        res.json({data: {}, status: "7", result: ""})
                    else {
                        res.json({data: {}, status: "0", result: raw.n ? "1" : "0"});
                    }
                })
            }
        });
    }

    //SET a new Mobile user Takin the params from the URL **To change **Deprecated
    functions.setMobileByURLParams = function (req, res) {
        var model = {};
        model.firstName = req.params.firstName;
        model.lastName = req.params.lastName;
        model.biinName = req.params.biinName;
        model.password = req.params.password;
        model.gender = req.params.gender;
        model.birthDate = req.params.birthdate;
        //** Set that the email is the same as biinName
        model.email = model.biinName;
        model.facebookId = "";
        req.body.model = model;
        functions.setMobile(req, res);
    };

    //SET a new Mobile user taking the params from the URL **To change **Deprecated
    functions.setMobileByURLParamsFacebook = function (req, res) {
        var model = {};
        model.firstName = req.params.firstName;
        model.lastName = req.params.lastName;
        model.biinName = req.params.biinName;
        model.password = req.params.password;
        model.gender = req.params.gender;
        model.birthDate = req.params.birthdate;
        //** Set that the email is the same as biinName
        model.email = model.biinName;
        model.facebookId = req.params.facebookId;
        req.body.model = model;
        functions.setMobileFacebook(req, res);
    };

    functions.setMobileFacebook = function (req, res) {
        var model = req.body.model;
        res.setHeader('Content-Type', 'application/json');
        mobileUser.findOne({'biinName': model.biinName}, function (err, mobileUserAccount) {
            if (mobileUserAccount) {
                var facebookId = model.facebookId || "";
                mobileUser.update({'identifier': mobileUserAccount.identifier}, {
                    biinName: model.email,
                    firstName: model.firstName,
                    lastName: model.lastName,
                    email: model.email,
                    gender: model.gender,
                    birthDate: model.birthDate,
                    accountState: true,
                    facebookId: facebookId
                }, function (err, raw) {
                    if (err)
                        res.json({data: {identifier: ""}, status: "5", result: "0"});
                    else {
                        if (raw.n > 0) {
                            res.json({data: {identifier: mobileUserAccount.identifier}, status: "0", result: "1"});
                        } else {
                            res.json({data: {identifier: ""}, status: "9", result: "0"});
                        }
                    }
                });
            } else {
                bcrypt.hash(model.password, 11, function (err, hash) {
                    var joinDate = utils.getDateNow();
                    var identifier = utils.getGUID();

                    //Build the default Biined Collection
                    var collectionIdentifier = utils.getGUID();
                    var defBiinedCollection = [{
                        identifier: collectionIdentifier,
                        subTitle: "This is a list of all your biined elements and sites.",
                        title: "Biined elements and sites",
                        elements: [],
                        sites: []
                    }];

                    var newModel = new mobileUser({
                        identifier: identifier,
                        firstName: model.firstName,
                        lastName: model.lastName,
                        biinName: model.biinName,
                        email: model.email,
                        password: hash,
                        birthDate: model.birthDate,
                        tempPassword: model.password,
                        gender: model.gender,
                        joinDate: joinDate,
                        accountState: true,
                        biinieCollections: defBiinedCollection,
                        facebookId: model.facebookId
                    });

                    //Save The Model
                    newModel.save(function (err) {
                        if (err)
                            res.json({data: {identifier: ""}, status: "5", result: "0"});
                        else {

                            //Send the verification of the e-mail
                            sendVerificationMail(req, newModel, function () {
                                //callback of mail verification
                                res.json({data: {identifier: identifier}, status: "0", result: "1"});
                            });
                        }

                    });
                });
            }
        });
    };

//Set a new Mobile User
    functions.setMobile = function (req, res) {

        var model = req.body.model;
        res.setHeader('Content-Type', 'application/json');
        var errors = utils.validate(new mobileUser().validations(), req, 'model');
        if (!errors) {
            mobileUser.findOne({'biinName': model.biinName}, function (err, mobileUserAccount) {
                if (mobileUserAccount) {
                    res.json({data: {identifier: ""}, status: "1", result: "0"});
                } else {
                    bcrypt.hash(model.password, 11, function (err, hash) {
                        var joinDate = utils.getDateNow();
                        var identifier = utils.getGUID();

                        //Build the default Biined Collection
                        var collectionIdentifier = utils.getGUID();
                        var defBiinedCollection = [{
                            identifier: collectionIdentifier,
                            subTitle: "This is a list of all your biined elements and sites.",
                            title: "Biined elements and sites",
                            elements: [],
                            sites: []
                        }];

                        var newModel = new mobileUser({
                            identifier: identifier,
                            firstName: model.firstName,
                            lastName: model.lastName,
                            biinName: model.biinName,
                            email: model.email,
                            password: hash,
                            birthDate: model.birthDate,
                            tempPassword: model.password,
                            gender: model.gender,
                            joinDate: joinDate,
                            accountState: false,
                            biinieCollections: defBiinedCollection,
                            facebookId: model.facebookId
                        });

                        //Save The Model
                        newModel.save(function (err) {
                            if (err)
                                res.json({data: {identifier: ""}, status: "5", result: "0"});
                            else {

                                //Send the verification of the e-mail
                                sendVerificationMail(req, newModel, function () {
                                    //callback of mail verification
                                    res.json({data: {identifier: identifier}, status: "0", result: "1"});
                                });
                            }

                        });
                    });
                }
            });
        }
        else {
            res.send({data: {errors: errors}, status: "6", result: "0"});
        }
    }

//POST a new item to a collection
    functions.setMobileBiinedToCollection = function (req, res) {
        var identifier = req.params.identifier;
        var collectionIdentifier = req.params.collectionIdentifier;

        var model = req.body.model;

        var objType = model.type;
        if (objType !== 'site') {
            if (identifier && model) {
                //Update the collection
                var updateCollectionCount = function (elId) {
                    organization.findOne({'elements.elementIdentifier': elId}, {'elements.$': 1}, function (err, el) {
                        if (err)
                            throw err;
                        else {
                            if (el && el.elements && el.elements.length > 0) {
                                organization.update({'elements._id': el.elements[0]._id}, {$inc: {'elements.$.biinedCount': 1}}, function (err, raw) {
                                    if (err)
                                        throw err;
                                });
                            }
                        }

                    })
                }

                var obj = {identifier: model.identifier, "_id": model._id};
                updateCollectionCount(model.identifier);
                mobileUser.update({
                        'identifier': identifier,
                        "biinieCollections.identifier": collectionIdentifier
                    },
                    {$push: {"biinieCollections.$.elements": obj}}, function (err, raw) {
                        if (err) {
                            res.json({status: "5", result: "0", data: {}});
                        } else {
                            if (raw.n > 0)
                                res.json({status: "0", result: "1", data: {}});
                            else
                                res.json({status: "1", result: "0", data: {}});
                        }
                    });
            }
        } else {
            if (identifier && model) {

                var obj = {identifier: model.identifier};
                mobileUser.update({
                        'identifier': identifier,
                        "biinieCollections.identifier": collectionIdentifier
                    },
                    {$push: {"biinieCollections.$.sites": obj}}, function (err, raw) {
                        if (err) {
                            res.json({status: "5", result: "0", data: {}});
                        } else {
                            if (raw.n > 0)
                                res.json({status: "0", result: "1", data: {}});
                            else
                                res.json({status: "1", result: "0", data: {}});
                        }
                    });
            }
        }
    }

//POST User Collect some object
    functions.setMobileCollect = function (req, res) {
        var identifier = req.params.identifier;
        var collectionIdentifier = req.params.collectionIdentifier;

        var model = req.body.model;

        var objType = model.type;
        if (objType !== 'site') {
            if (identifier && model) {
                //Update the collection
                var updateCollectionCount = function (elId) {
                    organization.findOne({'elements.elementIdentifier': elId}, {'elements.$': 1}, function (err, el) {
                        if (err)
                            throw err;
                        else {
                            if (el && el.elements && el.elements.length > 0) {
                                organization.update({'elements._id': el.elements[0]._id}, {$inc: {'elements.$.collectCount': 1}}, function (err, raw) {
                                    if (err)
                                        throw err;
                                });
                            }
                        }

                    })
                }

                var obj = {identifier: model.identifier, "_id": model._id};
                updateCollectionCount(model.identifier);
                mobileUser.update({
                        'identifier': identifier,
                        "biinieCollections.identifier": collectionIdentifier
                    },
                    {$push: {"biinieCollections.$.elements": obj}}, function (err, raw) {
                        if (err) {
                            res.json({status: "5", result: "0", data: {}});
                        } else {
                            if (raw.n > 0)
                                res.json({status: "0", result: "1", data: {}});
                            else
                                res.json({status: "1", result: "0", data: {}});
                        }
                    });
            }
        } else {
            if (identifier && model) {

                //Update the collection
                var updateCollectionCount = function (siteId) {
                    organization.findOne({'sites.identifier': siteId}, {'sites.$': 1}, function (err, site) {
                        if (err)
                            throw err;
                        else {
                            if (site && site.sites && site.sites.length > 0) {
                                organization.update({'sites._id': site.sites[0]._id}, {$inc: {'sites.$.collectCount': 1}}, function (err, raw) {
                                    if (err)
                                        throw err;
                                });
                            }
                        }

                    })
                }

                var obj = {identifier: model.identifier};
                updateCollectionCount(model.identifier);
                mobileUser.update({
                        'identifier': identifier,
                        "biinieCollections.identifier": collectionIdentifier
                    },
                    {$push: {"biinieCollections.$.sites": obj}}, function (err, raw) {
                        if (err) {
                            res.json({status: "5", result: "0", data: {}});
                        } else {
                            if (raw.n > 0)
                                res.json({status: "0", result: "1", data: {}});
                            else
                                res.json({status: "1", result: "0", data: {}});
                        }
                    });
            }
        }
    }

//PUT Site Notified
    functions.setShowcaseNotified = function (req, res) {
        var identifier = req.params.biinieIdentifier;
        var siteIdentifier = req.params.siteIdentifier;
        var showcaseIdentifier = req.params.showcaseIdentifier;

        mobileUser.findOne({'identifier': identifier}, {'showcaseNotified': 1}, function (err, user) {
            if (err)
                res.json({status: "5", data: {}});
            else {
                if (user) {
                    var siteObj = _.findWhere(user.showcaseNotified, {
                        siteIdentifier: siteIdentifier,
                        showcaseIdentifier: showcaseIdentifier
                    });
                    if (typeof(siteObj) === 'undefined') {
                        user.showcaseNotified.push({
                            siteIdentifier: siteIdentifier,
                            showcaseIdentifier: showcaseIdentifier
                        });
                        user.save(function (err) {
                            if (err)
                                res.json({status: "5", data: {}});
                            else
                                res.json({status: "0", data: {}});
                        });
                    } else {
                        res.json({status: "0", data: {}});
                    }
                } else {
                    res.json({status: "5", data: {}});
                }
            }
        });
    }

//PUT Share object
    functions.setShare = function (req, res) {
        var identifier = req.params.identifier;
        var model = req.body.model;
        model.shareDate = utils.getDateNow();

        mobileUser.update({"identifier": identifier}, {$push: {'shareObjects': model}}, function (err, raw) {
            if (err)
                res.json({status: "5", result: "0", data: {}});
            else if (raw.n > 0)
                res.json({status: "0", result: "1", data: {}});
            else
                res.json({status: "1", result: "0", data: {}});
        });
    }

//PUT Share object
    functions.setFollow = function (req, res) {
        var identifier = req.params.identifier;
        var model = req.body.model;
        model.followDate = utils.getDateNow();

        mobileUser.update({"identifier": identifier}, {$push: {'followObjects': model}}, function (err, raw) {
            if (err)
                res.json({status: "5", result: "0", data: {}});
            else if (raw.n > 0)
                res.json({status: "0", result: "1", data: {}});
            else
                res.json({status: "1", result: "0", data: {}});
        });
    }

//PUT Share object
    functions.setLiked = function (req, res) {
        var identifier = req.params.identifier;
        var model = req.body.model;
        model.likeDate = utils.getDateNow();

        mobileUser.update({"identifier": identifier}, {$push: {'likeObjects': model}}, function (err, raw) {
            if (err)
                res.json({status: "5", result: "0", data: {}});
            else if (raw.n > 0)
                res.json({status: "0", result: "1", data: {}});
            else
                res.json({status: "1", result: "0", data: {}});
        });

    }

//PUT Share object
    functions.setUnfollow = function (req, res) {
        var identifier = req.params.identifier;
        var model = req.body.model;
        model.followDate = utils.getDateNow();

        mobileUser.update({"identifier": identifier}, {$pull: {"followObjects": {"identifier": model.identifier}}}, function (err, raw) {
            if (err)
                res.json({status: "5", result: "0", data: {}});
            else if (raw.n > 0)
                res.json({status: "0", result: "1", data: {}});
            else
                res.json({status: "1", result: "0", data: {}});
        });
    }

//PUT Share object
    functions.setUnliked = function (req, res) {
        var identifier = req.params.identifier;
        var model = req.body.model;
        model.likeDate = utils.getDateNow();


        mobileUser.update({"identifier": identifier}, {$pull: {"likeObjects": {"identifier": model.identifier}}}, function (err, raw) {
            if (err)
                res.json({status: "5", result: "0", data: {}});
            else if (raw.n > 0)
                res.json({status: "0", result: "1", data: {}});
            else
                res.json({status: "1", result: "0", data: {}});
        });
    }

//Put Mobile Point
    functions.setMobileLoyaltyPoints = function (req, res) {
        var identifier = req.params.identifier;
        var organizationIdentifier = req.params.organizationIdentifier;
        var points = req.body.model.points;

        var hasLoyalty = false;
        var loyaltyModel = {
            organizationIdentifier: organizationIdentifier,
            isSubscribed: '1',
            subscriptionDate: utils.getDateNow(),
            points: "" + points,
            level: '0'
        }

        mobileUser.findOne({"identifier": identifier}, {'loyalty': 1}, function (err, foundModel) {
            if ('loyalty' in foundModel) {
                var hasLoyalty = false;
                var loyaltyModelSearch = _.findWhere(foundModel.loyalty, {organizationIdentifier: organizationIdentifier});
                if (typeof(loyaltyModelSearch) !== 'undefined') {
                    loyaltyModel = loyaltyModelSearch;
                    loyaltyModel.points = eval(loyaltyModel.points) + points
                    hasLoyalty = true;
                }
            } else {
                foundModel.loyalty = [];
            }

            if (!hasLoyalty)
                foundModel.loyalty.push(loyaltyModel);

            foundModel.save(function (err) {
                if (err)
                    throw err;
                else {
                    res.json({data: {}, status: '0', result: '1'});
                }
            })
        })
    }

//GET the share informatin of a biinie
    functions.getShare = function (req, res) {
        var identifier = req.params.identifier;
        mobileUser.findOne({'identifier': identifier}, {'_id': 0, 'shareObjects': 1}, function (err, mobUser) {
            if (err)
                res.json({status: "5", result: "0", data: {}});
            else if (mobUser && 'shareObjects' in mobUser) {
                res.json({status: "0", result: "1", data: mobUser.shareObjects});

            } else {
                res.json({status: "1", result: "0"});
            }
        })
    }

//DELETE a object to a Biined Collection
    functions.deleteMobileBiinedElementToCollection = function (req, res) {
        var identifier = req.params.identifier;
        var collectionIdentifier = req.params.collectionIdentifier;
        var objIdentifier = req.params.objIdentifier;


        //Update the collection
        var updateCollectionCount = function (elId) {
            organization.findOne({'elements.elementIdentifier': elId}, {'elements.$': 1}, function (err, el) {
                if (err)
                    throw err;
                else {
                    if (el && el.elements && el.elements.length > 0) {
                        organization.update({'elements._id': el.elements[0]._id}, {$inc: {'elements.$.biinedCount': -1}}, function (err, raw) {
                            if (err)
                                throw err;
                        });
                    }
                }

            })
        }

        updateCollectionCount(objIdentifier);
        mobileUser.findOne({
            'identifier': identifier,
            'biinieCollections.identifier': collectionIdentifier
        }, {'biinieCollections.$.elements': 1}, function (err, data) {
            if (err)
                res.json({status: "5", result: "0", data: {err: err}});
            else {
                var el = _.findWhere(data.biinieCollections[0].elements, {identifier: objIdentifier});
                data.biinieCollections[0].elements.pull({_id: el._id});
                data.save(function (err) {
                    if (err)
                        res.json({status: "5", data: {err: err}, result: "1"});
                    else {
                        //Return the state and the object
                        res.json({status: "0", result: "1", data: {}});
                    }
                });

            }
        })
    }

//DELETE a object to a Biined Collection
    functions.deleteMobileBiinedSiteToCollection = function (req, res) {
        var identifier = req.params.identifier;
        var collectionIdentifier = req.params.collectionIdentifier;
        var objIdentifier = req.params.objIdentifier;

        mobileUser.findOne({
            'identifier': identifier,
            'biinieCollections.identifier': collectionIdentifier
        }, {'biinieCollections.$.sites': 1}, function (err, data) {
            if (err)
                res.json({status: "5", result: "0", data: {err: err}});
            else {
                var el = _.findWhere(data.biinieCollections[0].sites, {identifier: objIdentifier});
                data.biinieCollections[0].sites.pull({_id: el._id});
                data.save(function (err) {
                    if (err)
                        res.json({status: "5", result: "0", data: {err: err}});
                    else {
                        //Return the state and the object
                        res.json({status: "0", result: "1", data: {}});
                    }
                });

            }
        })
    }

//DELETE a object to a Collect Collection
    functions.deleteMobileCollectElementToCollection = function (req, res) {
        var identifier = req.params.identifier;
        var collectionIdentifier = req.params.collectionIdentifier;
        var objIdentifier = req.params.objIdentifier;


        //Update the collection
        var updateCollectionCount = function (elId) {
            organization.findOne({'elements.elementIdentifier': elId}, {'elements.$': 1}, function (err, el) {
                if (err)
                    throw err;
                else {
                    if (el && el.elements && el.elements.length > 0) {
                        organization.update({'elements._id': el.elements[0]._id}, {$inc: {'elements.$.collectCount': -1}}, function (err, raw) {
                            if (err)
                                throw err;
                        });
                    }
                }

            })
        }

        updateCollectionCount(objIdentifier);
        mobileUser.findOne({
            'identifier': identifier,
            'biinieCollections.identifier': collectionIdentifier
        }, {'biinieCollections.$.elements': 1}, function (err, data) {
            if (err)
                res.json({status: "5", result: "0", data: {err: err}});
            else {
                var el = _.findWhere(data.biinieCollections[0].elements, {identifier: objIdentifier});
                data.biinieCollections[0].elements.pull({_id: el._id});
                data.save(function (err) {
                    if (err)
                        res.json({status: "5", data: {err: err}, result: "1"});
                    else {
                        //Return the state and the object
                        res.json({status: "0", result: "1", data: {}});
                    }
                });

            }
        })
    }

//DELETE a object to a collect Collection
    functions.deleteMobileCollectSiteToCollection = function (req, res) {
        var identifier = req.params.identifier;
        var collectionIdentifier = req.params.collectionIdentifier;
        var objIdentifier = req.params.objIdentifier;

        //Update the collection
        var updateCollectionCount = function (siteId) {
            organization.findOne({'sites.identifier': siteId}, {'sites.$': 1}, function (err, sites) {
                if (err)
                    throw err;
                else {
                    if (sites && sites.sites && sites.sites.length > 0) {
                        organization.update({'sites._id': sites.sites[0]._id}, {$inc: {'sites.$.collectCount': -1}}, function (err, raw) {
                            if (err)
                                throw err;
                        });
                    }
                }

            })
        }

        updateCollectionCount(objIdentifier);

        mobileUser.findOne({
            'identifier': identifier,
            'biinieCollections.identifier': collectionIdentifier
        }, {'biinieCollections.$.sites': 1}, function (err, data) {
            if (err)
                res.json({status: "5", result: "0", data: {err: err}});
            else {
                var el = _.findWhere(data.biinieCollections[0].sites, {identifier: objIdentifier});
                data.biinieCollections[0].sites.pull({_id: el._id});
                data.save(function (err) {
                    if (err)
                        res.json({status: "5", result: "0", data: {err: err}});
                    else {
                        //Return the state and the object
                        res.json({status: "0", result: "1", data: {}});
                    }
                });

            }
        })
    }


//Update by mobile Id
    functions.updateMobile = function (req, res) {


        var model = req.body.model;
        var identifier = req.params.identifier;

        var createNewUser = function(model){
            bcrypt.hash(model.password, 11, function (err, hash) {
                var joinDate = utils.getDateNow();
                var identifier = utils.getGUID();

                //Build the default Biined Collection
                var collectionIdentifier = utils.getGUID();
                var defBiinedCollection = [{
                    identifier: collectionIdentifier,
                    subTitle: "This is a list of all your biined elements and sites.",
                    title: "Biined elements and sites",
                    elements: [],
                    sites: []
                }];

                model.birthDate = model.birthDate? model.birthDate : joinDate;


                model.facebookId = model.facebook_id || "";
                model.facebookFriends= model.facebookFriends || [];
                model.facebookAvatarUrl= model.facebookAvatarUrl || "";

                var newModel = new mobileUser({
                    identifier: identifier,
                    firstName: model.firstName,
                    lastName: model.lastName,
                    biinName: model.email,
                    email: model.email,
                    password: hash,
                    birthDate: model.birthDate,
                    tempPassword: model.password,
                    gender: model.gender,
                    joinDate: joinDate,
                    accountState: model.facebookId != "",
                    biinieCollections: defBiinedCollection,
                    facebookId: model.facebookId,
                    facebookFriends: model.facebookFriends,
                    facebookAvatarUrl: model.facebookAvatarUrl
                });

                //Save The Model
                newModel.save(function (err) {
                    if (err)
                        res.json({data: {identifier: ""}, status: "5", result: "0"});
                    else {

                        //Send the verification of the e-mail
                        sendVerificationMail(req, newModel, function () {
                            //callback of mail verification
                            var modelToReturn = newModel.toObject();
                            modelToReturn.facebook_id = modelToReturn.facebookId;
                            modelToReturn.birthDate = modelToReturn.birthDate.replace("T", " ").replace("Z", "");
                            modelToReturn.isEmailVerified = modelToReturn.accountState ? "1" : "0";
                            delete modelToReturn.facebookId;
                            delete modelToReturn.accountState;
                            res.json({data: modelToReturn, status: "0", result: "1"});
                        });
                    }

                });
            });
        };
        var updateModel = function (model) {
            var birthDate = utils.getDate(model.birthDate);
            var facebookId = model.facebook_id || "";
            var accountState = model.facebook_id != "";

            model.facebookFriends= model.facebookFriends || [];
            model.facebookAvatarUrl= model.facebookAvatarUrl || "";

            mobileUser.update({'identifier': identifier}, {
                biinName: model.email,
                firstName: model.firstName,
                lastName: model.lastName,
                email: model.email,
                gender: model.gender,
                birthDate: birthDate,
                accountState : accountState,
                facebookId: facebookId,
                facebookFriends: model.facebookFriends,
                facebookAvatarUrl: model.facebookAvatarUrl

            }, function (err, raw) {
                if (err)
                    res.json({data: {}, status: "5", result: "0"});
                else {
                    model.identifier = identifier;
                    model.biinName = model.email;
                    sendVerificationMail(req, model, function () {
                        var modelToReturn = model;
                        modelToReturn.birthDate = birthDate.replace("T", " ").replace("Z", "");
                        modelToReturn.isEmailVerified = modelToReturn.accountState ? "1" : "0";
                        modelToReturn.facebook_id = facebookId;
                        delete modelToReturn.facebookId;
                        delete modelToReturn.accountState;
                        res.json({data: modelToReturn, status: "0", result: "1"});
                    })
                }
            })
        };
        

        if(model){
            mobileUser.findOne({'biinName': model.email}, function (err, foundEmail) {
                if (err)
                    res.json({data: {}, status: "5", result: "0"});
                else if (typeof(foundEmail) === "undefined" || foundEmail === null) {
                    createNewUser(model);
                } else {
                    if(identifier == "none")
                        identifier = foundEmail.identifier;
                    updateModel(model);
                }
            })
        } else {
            res.json({data: {}, status: "5", result: "0"});
        }


    };

//Get the authentication of the user **To change **Deprecated
    functions.login = function (req, res) {
        var user = req.params.user;
        var password = req.params.password;

        mobileUser.findOne({'biinName': user}, function (err, foundBinnie) {
            if (err)
                res.json({data: {identifier: ""}, status: "5", result: "0"});
            else {
                var result = typeof(foundBinnie) !== 'undefined' && foundBinnie !== null;
                var identifier = "";
                if (result) {
                    foundBinnie.comparePassword(password, function (err, isMath) {
                        identifier = foundBinnie.identifier;
                        var isMathToString = isMath ? "1" : "0";
                        var code = isMath ? "0" : "8";
                        res.json({data: {identifier: identifier}, status: code, result: isMathToString});
                    });
                } else {
                    res.json({data: {identifier: identifier}, status: "7", result: "0"});
                }
            }
        });
    };

//Get the authentication of the user **To change **Deprecated
    functions.loginFacebook = function (req, res) {
        var user = req.params.user;

        mobileUser.findOne({'biinName': user}, function (err, foundBinnie) {
            if (err)
                res.json({data: {identifier: ""}, status: "5", result: "0"});
            else {
                var result = typeof(foundBinnie) !== 'undefined' && foundBinnie !== null;
                var identifier = "";
                if (result) {
                    identifier = foundBinnie.identifier;
                    res.json({data: {identifier: identifier}, status: "0", result: "1"});
                } else {
                    res.json({data: {identifier: identifier}, status: "7", result: "0"});
                }
            }
        });
    };

//GET/POST the activation of the user
    functions.activate = function (req, res) {
        var identifier = req.params.identifier;
        mobileUser.findOne({'identifier': identifier, accountState: false}, function (err, foundBinnie) {
            if (err)
                res.send(500, "The user was not found");
            else {
                if (typeof(foundBinnie) === 'undefined' || foundBinnie === null)
                    res.send(500, "The user was not found");

                foundBinnie.accountState = true;
                foundBinnie.save(function (err) {
                    if (err)
                        res.send(err, 500);
                    else {
                        //Return the state and the object
                        res.json("/verifiedBinnie");
                    }
                });
            }
        })
    }

//Get if an Biinie is active
    functions.isActivate = function (req, res) {
        var identifier = req.params.identifier;
        res.setHeader('Content-Type', 'application/json');
        mobileUser.findOne({'identifier': identifier, accountState: true}, function (err, foundBinnie) {
            if (err)
                res.json({data: {}, status: "7", result: "0"})
            else {
                var result = typeof(foundBinnie) !== 'undefined' && foundBinnie !== null;
                res.json({data: {}, status: "0", result: result});
            }
        });
    }

//Send an e-mail verification
    function sendVerificationMail(req, model, callback) {

        var transporter = require('nodemailer').createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_ACCOUNT,
                pass: process.env.EMAIL_PASSWORD
            }
        });



        var url = req.protocol + '://' + req.get('host') + "/biinie/" + model.identifier + "/activate";
        var subject = "Bienvenido a Biin&nbsp;😀";

        var path = require('path');


        var htmlEmailTemplate = fs.readFileSync(__dirname + '/../config/email.html',"utf-8");
        htmlEmailTemplate.replace(/#####/g,url);
        // setup e-mail data with unicode symbols
        var mailOptions = {
            // sender address
            from: process.env.EMAIL_ACCOUNT,

            // list of receivers
            to: model.biinName,

            // Subject line
            subject: subject,

            // plaintext body
            text: "",

            // html body
            html: htmlEmailTemplate
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            callback();
        });
    }

//DELETE an specific showcase
    functions.delete = function (req, res) {
        //Perform an update
        var identifier = req.params.identifier;

        mobileUser.remove({'identifier': identifier}, function (err) {
            if (err)
                res.send(err, 500)
            else
                res.send(200);
        });
    }

//Post the Image of the Organization
    functions.uploadImage = function (req, res) {
        //Read the fileer.name;
        var binnieIdentifier = req.params.identifier;
        res.setHeader('Content-Type', 'application/json');

        if (!util.isArray(req.files.file)) {

            var file = req.files.file;

            //var data = fs.readFileSync(file.path);
            var imagesDirectory = 'binnies';
            var systemImageName = '/media/' + binnieIdentifier + "/" + utils.getGUID() + "." + utils.getExtension(file.originalFilename);
            imageManager.uploadFile(file.path, imagesDirectory, systemImageName, false, function (url) {
                var mediaObj = {url: url};
                res.json({data: mediaObj});
            });

        } else {
            res.send(err, 500);
        }
    }

    return functions;
}
