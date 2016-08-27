//Schemas
var client = require('../../models/client'),
    organization = require('../../models/organization'),
    roles = require('../../models/roles');
var utils = require('../utils.server.controller');
var passport = require('../auth.server.controller');
var rolesEnum = require('../enums/roles.enum');
var passwordGenerator = require('password-generator');
var emailSender = require('../emailsender.server.controller');
var _ = require('underscore');


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
                emails: [model.name],
                selectedOrganization: organizationIdentifier,
                role: rolesEnum.ADMINISTRATOR
            });

            //Create the default Organization and then send the e-mail verification
            createDefaultOrganization(accountIdentifier, organizationIdentifier, company, function (organization) {
                //Save The Model
                newModel.organizations = [organization._id];
                newModel.save(function (err) {
                    if (err)
                        throw err;
                    else {
                        //Sent the e-mail verification
                        emailSender.sendVerificationMail(req, newModel, function (err) {
                            if (err)
                                res.send(500);
                            else
                            //login with the client
                                req.logIn(newModel, function (err) {
                                    if (err)
                                        res.json({status: 1});
                                    else {
                                        //Return the state and the object
                                        res.json({status: 0, redirect: "/home"});
                                    }
                                })
                        });
                    }
                });


            });


        }
    });
};




/**
 * Get user information
 */
exports.listClient = function(req,res){
    res.setHeader('Content-Type', 'application/json');
    var data= {};

    //Get the Profile Information
    client.findOne({name:req.user.name},{profilePhoto:1,displayName:1,lastName:1,name:1,emails:1,phoneNumber:1, defaultOrganization:1, accountIdentifier:1, selectedOrganization:1, role:1},function(err,data){
        if(err)
            res.send(err, 500);
        else
            res.json({data:data});
    });
};

exports.updateClient =function(req,res){
    var model =req.body.model;
    if(!req.user || !model.name)
    {
        res.send("Error",500);
    }
    else{
        var identifier= req.user.name;

        var updateModel =
        {
            name:model.name,
            displayName:model.displayName? model.displayName:"",
            lastName:model.lastName?model.lastName:"",
            emails:model.emails?model.emails:[],
            phoneNumber:model.phoneNumber ?model.phoneNumber:""
        };

        //Update the client data
        client.update({name: identifier },updateModel,function(err){
            if(err)
                res.send(err, 500);
            else
            {
                req.user.name = updateModel.name;
                req.user.displayName=updateModel.displayName;
                req.user.lastName=updateModel.lastName;
                req.user.emails=updateModel.emails;
                req.user.phoneNumber=updateModel.phoneNumber;
                if(identifier == updateModel.name)
                    res.status(200).send({needToRelog:false});
                else {
                    res.status(200).send({needToRelog:true});
                }
            }
        });
    }
};


//GET verify a e-mail availability
exports.verifyEmailAvailability = function (req, res) {
    var value = req.body.value;
    if (value) {
        client.findOne({name: value}, function (err, model) {
            if (err)
                res.json({result: false});
            res.json({result: typeof(model) === 'undefined' || model === null})
        });
    } else {
        res.json({result: false});
    }

};

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

};

//Logout the client
exports.logoutClient = function (req, res) {
    req.session.destroy();
    req.logout();
    res.redirect('/');
};

//Other exports
function createDefaultOrganization(accountIdentifier, organizationIdentifier, companyName, callback) {
    var newModel = new organization();

    //Set the account and de user identifier
    newModel.identifier = organizationIdentifier;
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

exports.loginCMS = function (req,res,next) {
    passport.authenticate('clientLocal', function (err, user) {
            if (err) {
                return next(err);
            }
            if (!user) {
                return res.status(401).send({
                    "message":"Wrong credentials"
                });
            }
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                //Get role permission
                else if(user.role) {
                    user = user.toObject();
                    roles.find({
                        "role": user.role
                    }, {
                        permission: 1
                    }).lean().exec(function(err, data) {
                        if(err)
                            res.send(err, 500);
                        else {
                            user.permissions = data;
                            return res.status(200).send({
                                "account": user
                            });
                        }

                    });
                }
            });
        }
    )
    (req, res, next);
};

exports.inviteNewClient = function(req,res){

    let email = req.body.email;
    let displayName = req.body.displayName;
    let lastName = req.body.lastName;
    let accountIdentifier = utils.getGUID();
    let organizationId = req.body.organizationId;
    let organization_id = "";

    organization.findOne({identifier:organizationId},{_id:1},function (err,org) {
        if(err){
            res.status(500).json(err);
        } else if(org){
            organization_id = org._id;
            client.findOne({name: email}, function (err, foundClient) {
                if (foundClient) {
                    foundClient.organizations.push(organization_id);
                    foundClient.save(function (err, updatedClient) {
                        if(err)
                            res.status(500).json(err);
                        else
                            res.json(updatedClient);
                    });
                } else {
                    let password = passwordGenerator();
                    var newModel = new client({
                        displayName : displayName,
                        lastName : lastName,
                        accountIdentifier: accountIdentifier,
                        name: email,
                        password: password,
                        accountState: false,
                        defaultOrganization: organizationId,
                        emails: [email],
                        selectedOrganization: organizationId,
                        role: rolesEnum.MANAGER
                    });
                    newModel.organizations = [organization_id];
                    newModel.save(function (err) {
                        if (err)
                            res.status(500).json(err);
                        else {
                            //Sent the e-mail verification
                            emailSender.sendInvitationMail(req, newModel,password, function (err) {
                                if (err)
                                    res.status(500).json(err);
                                else
                                    res.json(newModel);
                            });
                        }
                    });
                }
            });
        } else {
            res.status(500).json('No organization Found');
        }
    });
};

exports.getClientsByOrganization = function(req,res){
    let organizationId = req.params.idorganization;
    organization.findOne({identifier:organizationId},{_id:1},function (err,org) {
        if(err){
            res.status(500).json(err);
        } else if(org){
            organization_id = org._id;
            client.find({organizations:organization_id}, function (err, foundClients) {
                if(err){
                    res.status(500).json(err);
                } else {
                    res.json(foundClients);
                }
            });
        } else {
            res.status(500).json('No organization Found');
        }
    });
};


//THIS FUNCTION SHOULD BE CALLED ONCE ONLY
exports.upgradeOrganizationManagement = function(req,res){
    var clientsToUpdate = [];

    function updateClient(clientId){
        return new Promise(function (resolve, reject) {
           organization.find({accountIdentifier:clientId},{_id:1},function (err,organizationsFound) {
               if(err) {
                   reject(err);
               } else {
                   let orgsIDs = _.map(organizationsFound, "_id");
                    client.findOne({accountIdentifier:clientId},{},function (err,clientFound) {
                        if(err){
                            reject(err);
                        } else {
                            clientFound.organizations = orgsIDs;
                            clientFound.save(function (err) {
                                if(err)
                                    reject(err);
                                else
                                    resolve();
                            })
                        }
                    })
               }
           })
        });
    }

    client.find({},{},function (err, clients) {
        if(err){
            throw err;
        } else {
            clientsToUpdate = clients;
            let promiseArray = [];
            clientsToUpdate.forEach(function (clientToPromise) {
                promiseArray.push(updateClient(clientToPromise.accountIdentifier));
            });
            Promise.all(promiseArray).then(function () {
                res.json("All good");
            },function (err) {
                res.status(500).json(err);
            })
        }
    })
};

