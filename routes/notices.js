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
        var data = req.body;
        var organizationId = req.param('identifier');
        notices.update({identifier:data.notice.identifier},data.notice, function(err,success ){
            if(err){
                res.status(500).send(err);
            }else{
                organization.findOne({identifier:organizationId},{sites:1},function(err,organization){
                    if(err){
                        res.status(500).send(err);
                    } else {

                        for(var i = 0; i < organization.sites.length; i++){

                            var sitesNotices = organization.sites[i].notices;
                            var siteAssigned = _.find(data.sites,function(site){
                                return site.site.identifier == organization.sites[i].identifier;
                            });

                            if(siteAssigned) {
                                if ( siteAssigned.isAssigned && sitesNotices.indexOf(data.notice.identifier) == -1)
                                    sitesNotices.push(data.notice.identifier);
                                else if(!siteAssigned.isAssigned && sitesNotices.indexOf(data.notice.identifier) > -1){
                                    sitesNotices = _.without(sitesNotices,data.notice.identifier);
                                }
                            }
                            organization.sites[i].notices = sitesNotices;
                        }

                        organization.save(function(err, organization){
                            if(err){
                                res.status(400).send(err);
                            } else {
                                res.status(200).send(organization);
                            }
                        })
                    }
                });
            }
        });
    };


    return functions;
};