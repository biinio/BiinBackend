var organization = require('../schemas/organization');
var path = require("path");

module.exports = function () {
    var functions = {};

    //Get the organization Information to work
    functions.getOrganization = function (identifier, req, res, param, callback) {
        organization.findOne({
            "accountIdentifier": req.user.accountIdentifier,
            "identifier": identifier
        }, param, function (err, data) {
            //req.session.defaultOrganization
            //req.user.defaultOrganization

            //If the data is not valid
            if (!data) {
                req.session.selectedOrganization = null;
                res.redirect('/accounts');
            } else {
                req.session.selectedOrganization = data;
                callback(data, req, res);
            }

        });
    }


    return functions;
}

