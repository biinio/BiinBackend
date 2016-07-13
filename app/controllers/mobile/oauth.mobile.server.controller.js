var oauthMobileAPIGrants = require('../../models/oauthMobileAPIGrants')
    , passport = require('passport')
    , bcrypt = require('bcrypt')
    , moment = require('moment')
    , utils = require('../utils.server.controller');

//PUT a new Client to request grant the request of the mobile api
exports.set = function (req, res) {
    var clientId = req.body['client'];
    oauthMobileAPIGrants.findOne({clientIdentifier: clientId}, function (err, user) {
        if (user) {
            res.send("The Client is all ready registered", 422)
        } else {

            //Gen the client secret
            var clientSecret = utils.getUIDByLen(process.env.OAUTH_CLIENT_SECRET_LEN);
            var date = moment().format('YYYY-MM-DD h:mm:ss');

            //Save the client
            var newModel = new oauthMobileAPIGrants({
                clientIdentifier: clientId,
                clientSecret: clientSecret,
                creationData: date
            });
            newModel.save(function (err) {
                if (err)
                    throw err;
                res.send({clientIdentifier: clientId, clientSecret: clientSecret}, 201);
            });
        }
    });
};