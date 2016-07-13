//Schemas
var client = require('../../models/client'),
    organization = require('../../models/organization'),
    role = require('../../models/roles');
var utils = require('../utils.server.controller');

exports.setClient = function (req, res) {
    var model = req.body.model;
    var company = req.body.model.company;

    client.findOne({name: model.name}, function (err, foundClient) {
        if (foundClient) {
            res.send(500, 'The Account Name is already taken');
        } else {

            var organizationIdentifier = utils.getGUID();

            var accountIdentifier = utils.getGUID();
            var newModel = new client({
                accountIdentifier: accountIdentifier,
                name: model.name,
                password: model.password,
                accountState: false,
                defaultOrganization: organizationIdentifier,
                emails: [model.name]
            });

            //Save The Model
            newModel.save(function (err) {
                if (err)
                    throw err;
                else {
                    //Create the default Organization and then send the e-mail verification
                    createDefaultOrganization(accountIdentifier, organizationIdentifier, company, function (organization) {
                        //Sent the e-mail verification
                        sendVerificationMail(req, newModel, function (err) {
                            if (err)
                                res.send(500);
                            else
                            //login with the client
                                req.logIn(newModel, function (err) {
                                    if (err)
                                        res.json({status: 1})
                                    else {
                                        req.session.defaultOrganization = organization;
                                        //Return the state and the object
                                        res.json({status: 0, redirect: "/home"});
                                    }
                                })
                        });
                    })
                }
            });
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

    var url = req.protocol + '://' + req.get('host') + "/client/" + model.accountIdentifier + "/activate";
    var subject = "Welcome to Biin";
    var htmlBody = "<h3>" + subject + "</h3>" +
        "<b>Hi</b>: <pre style='font-size: 14px'>" + model.displayName + "</pre>" +
        "<b>Thanks for join Biin</b>" +
        "<b>Your user is </b>: <pre style='font-size: 14px'>" + model.name + "</pre>" +
        "<b>In order to complete your registration please visit the following link</b><a href='" + url + "'> BIIN USER ACTIVATION </a>";

    // setup e-mail data with unicode symbols
    var mailOptions = {
        // sender address
        from: "[ BIIN NO REPLY] <" + process.env.EMAIL_ACCOUNT + ">",

        // list of receivers
        to: model.emails[0],

        // Subject line
        subject: subject,

        // plaintext body
        text: "",

        // html body
        html: htmlBody
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        callback();
    });
}

//Set the activation of an user
exports.activateClient = function (req, res) {

    var userAccount = req.param("identifier");
    client.findOne({accountIdentifier: userAccount, accountState: false}, function (err, foundClient) {
        if (err)
            res.send(500, "The user was not found")
        else {
            if (typeof(foundClient) === 'undefined' || foundClient == null)
                res.send(500, "The user was not found")
            foundClient.accountState = true;
            foundClient.save(function (err) {
                if (err)
                    res.send(err, 500);
                else {
                    req.logIn(foundClient, function (err) {
                        if (err)
                            res.send(500)
                        else
                        //Return the state and the object
                            res.redirect("/home");
                    })
                }
            });
        }
    })

}

//Other exports
function createDefaultOrganization(accountIdentifier, organizationIdentifier, companyName, callback) {
    var newModel = new organization();

    //Set the account and de user identifier
    newModel.identifier = organizationIdentifier
    newModel.accountIdentifier = accountIdentifier;
    newModel.name = companyName;

    //Perform an create
    newModel.save(function (err) {
        if (err)
            res.send(err, 500);
        else {
            //Return the state and the object
            callback(newModel)
        }
    });
}



