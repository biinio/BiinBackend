/**
 * Created by Ivan on 5/31/16.
 */
module.exports = function () {

    //Custom Utils
    var util = require('util');
    var notices = require('../schemas/notices'),
        organization = require('../schemas/organization'),
        routesUtils = require('../biin_modules/routesUtils')();

    var _ = require('underscore');
    var utils = require('../biin_modules/utils')();

    var functions = {};


    //GET the biins by organization Identifier
    functions.get = function (req, res) {
        var organizationId = req.param('identifier');

        notices.find({organizationIdentifier: organizationId, isDeleted : false}, function (err, data) {
            if(err)
                res.json({data:[]});
            else
                res.json({data: data});
        });
    };

    functions.create = function(req, res){
        var newNotice = new notices();
        newNotice.organizationIdentifier = req.param('identifier');
        newNotice.identifier = utils.getGUID();
        newNotice.save(function(err, notice){
            if(err){
                res.status(500).send(err);
            }else{
                res.status(201).json(notice);
            }
        });
    };

    functions.update = function(req, res){

    };


    return functions;
};