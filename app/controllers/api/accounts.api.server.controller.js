//Schemas
var util = require('util'), fs = require('fs');

//Custom Utils
var utils = require('../utils.server.controller');
var client = require('../../models/client'), imageManager = require('../image.server.controller');
var organization = require('../../models/organization');

//Get Client List
exports.list = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var data = {};

    //Get the Profile Information
    client.findOne({name: req.user.name}, {
        profilePhoto: 1,
        displayName: 1,
        lastName: 1,
        name: 1,
        emails: 1,
        phoneNumber: 1,
        defaultOrganization: 1,
        accountIdentifier: 1
    }, function (err, data) {
        if (err)
            res.send(err, 500);
        else

            res.json({data: {profile: data}});
    });
}

//Set the Client Profile
exports.set = function (req, res) {
    var identifier = req.user.name;

    var model = req.body.model;

    var updateModel =
    {
        displayName: model.displayName ? model.displayName : "",
        lastName: model.lastName ? model.lastName : "",
        emails: model.emails ? model.emails : [],
        phoneNumber: model.phoneNumber ? model.phoneNumber : ""
    };

    //Update the client data
    client.update({name: identifier}, updateModel, function (err) {
        if (err)
            res.send(err, 500);
        else {
            req.user.displayName = updateModel.displayName;
            req.user.lastName = updateModel.lastName;
            req.user.emails = updateModel.emails;
            req.user.phoneNumber = updateModel.phoneNumber;

            res.send(200);
        }
    });
};

//Set the Default Organization
exports.setDefaultOrganization = function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    var orgIdentifier = req.param('organizationIdentifier');
    client.update({name: req.user.name}, {defaultOrganization: orgIdentifier}, function (err) {
        if (err)
            res.send({status: 500});
        else {

            if (orgIdentifier !== '') {
                //Update the organization in cache
                organization.findOne({
                    "accountIdentifier": req.user.accountIdentifier,
                    "identifier": orgIdentifier
                }, {name: true, identifier: true}, function (err, data) {
                    //set the first time for the data
                    //req.session.defaultOrganization = data;
                    //req.user.defaultOrganization = data;
                    res.send({status: 200});
                });
            }
        }
    });
};

//Post the Image of the Profile
exports.uploadImageProfile = function (req, res) {
    //Read the file
    var userAccount = req.headers["accountidentifier"];
    var userIdentifier = req.headers["name"];
    res.setHeader('Content-Type', 'application/json');

    if (!util.isArray(req.files.file)) {

        var file = req.files.file;
        //var data = fs.readFileSync(file.path);

        var imagesDirectory = userAccount;
        var systemImageName = 'media/' + userAccount + "_profile." + utils.getExtension(file.originalFilename);

        imageManager.uploadFile(file.path, imagesDirectory, systemImageName, false, function (url) {
            client.update({name: userIdentifier}, {profilePhoto: url}, function (err) {
                if (err)
                    res.send(err, 500);
                else {
                    res.json({data: url});
                }
            });
        });


    } else {
        res.send(err, 500);
    }
};

