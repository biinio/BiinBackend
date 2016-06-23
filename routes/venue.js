module.exports = function () {
    //Custom Utils
    var utils = require('../biin_modules/utils')();
    var util = require('util');

    //Schemas
    var organizations = require('../schemas/organization');
    var venues = require('../schemas/venue');
    //var regionRoutes = require('./regions')();

    var functions = {};

    //GET the list of venues
    functions.getVenueALike = function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        var regexName = new RegExp(req.headers['regex'], 'i');
        var orgIdentifier = req.headers['orgidentifier'];
        venues.find({name: regexName, organizationIdentifier: orgIdentifier}, {
            _id: 0,
            identifier: 1,
            name: 1
        }).lean().exec(function (err, data) {
            var searchResult = data;
            res.json(searchResult);
        });
    }

    //Create a new venue
    functions.createVenue = function (req, res) {
        var nameVenue = req.headers['name'];
        var orgIdentifier = req.headers['orgidentifier'];
        var id = utils.getGUID();
        venues.findOne({name: nameVenue, organizationIdentifier: orgIdentifier}, {
            _id: 0,
            identifier: 1,
            name: 1,
            organizationIdentifier: 1
        }).exec(function (err, data) {
            if (!data) {
                venues.create({'identifier': id, 'name': nameVenue, 'organizationIdentifier': orgIdentifier},
                    function (err) {
                        if (err)
                            res.send(500);
                        else
                            res.send(201);
                    });
            }
            else {
                res.send(200);
            }
        });
    }
    return functions;
}
