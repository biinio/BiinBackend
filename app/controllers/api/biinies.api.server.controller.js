var _ = require('underscore');
var fs = require('fs');

//Schemas
var mobileUser = require('../../models/mobileUser'),
    util = require('util'),
    bcrypt = require('bcrypt'),
    imageManager = require('../image.server.controller'),
    category = require('../../models/category'),
    moment = require('moment'),
    utils = require("../utils.server.controller");
var organization = require('../../models/organization');
var dateFormat = "YYYY-MM-DDTHH:mm:ss";

var gifts = require('./gifts.api.server.controller');


//GET the Main view of an Binnies
exports.indexBiinies = function (req, res) {
    res.render('binnie/index', {title: 'Binnies list', user: req.user, organization: null});
};

//Get the list of Binnies
exports.getBiinies = function (req, res) {
    var prototype = new mobileUser();

    res.setHeader('Content-Type', 'application/json');
    mobileUser.find({}, function (err, binnies) {
        if (err)
            res.send(500);
        else
            res.json({data: binnies, prototype: prototype});
    });
};

//PUT a new Mobile User
exports.setBiinies = function (req, res) {

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
};

//DELETE an specific showcase
exports.deleteBiinies = function (req, res) {
    //Perform an update
    var identifier = req.params.identifier;

    mobileUser.remove({'identifier': identifier}, function (err) {
        if (err)
            res.send(err, 500)
        else
            res.send(200);
    });
};

//Post the Image of the Organization
exports.uploadImageBiinies = function (req, res) {
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
};
