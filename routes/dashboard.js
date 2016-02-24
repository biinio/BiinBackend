module.exports = function () {

    //Schemas
    var util = require('util'), fs = require('fs');
    var _ = require('underscore');
    //Custom Utils
    var utils = require('../biin_modules/utils')();

    var client = require('../schemas/client'), imageManager = require('../biin_modules/imageManager')();
    var organization = require('../schemas/organization');
    var showcase = require('../schemas/showcase');

    var mobileActions = require('../schemas/mobileActions');
    var mobileHistory = require('../schemas/mobileHistory');
    var biin = require('../schemas/biin');
    var visits = require('../schemas/visits');

    //Tracking schemas
    var trackingBeacon = require('../schemas/trackingbeacon'),
        trackingFollow = require('../schemas/trackingfollows'),
        trackingSites = require('../schemas/trackingsites'),
        trackingLikes = require('../schemas/trackinglikes'),
        trackingElements = require('../schemas/trackingelements'),
        trackingBiined = require('../schemas/trackingbiined'),
        trackingNotifications = require('../schemas/trackingnotifications');

    var ENTER_BIIN_REGION = "1";//TO->ID:beacon identifier
    var EXIT_BIIN_REGION = "2";//TO->ID:beacon identifier
    var BIIN_NOTIFIED = "3"; //TO->ID:_id object in biins
    var NOTIFICATION_OPENED = "4"; //TO->ID:_id object in biins

    var ENTER_ELEMENT_VIEW = "5"; //TO->ID:element identifier
    var EXIT_ELEMENT_VIEW = "6"; //TO->ID:element identifier
    var LIKE_ELEMENT = "7"; //TO->ID:element identifier
    var UNLIKE_ELEMENT = "8"; //TO->ID:element identifier
    var COLLECTED_ELEMENT = "9"; //TO->ID:element identifier
    var UNCOLLECTED_ELEMENT = "10"; //TO->ID:element identifier
    var SHARE_ELEMENT = "11"; //TO->ID:element identifier

    var ENTER_SITE_VIEW = "12"; //TO->ID:site identifier
    var EXIT_SITE_VIEW = "13"; //TO->ID:site identifier
    var LIKE_SITE = "14"; //TO->ID:site identifier
    var UNLIKE_SITE = "15"; //TO->ID:site identifier
    var FOLLOW_SITE = "16"; //TO->ID:site identifier
    var UNFOLLOW_SITE = "17"; //TO->ID:site identifier
    var SHARE_SITE = "18"; //TO->ID:site identifier

    var ENTER_BIIN = "19"; //TO->ID:beacon identifier
    var EXIT_BIIN = "20"; //TO->ID:beacon identifier

    var OPEN_APP = "21"; //TO->"biin_ios"
    var CLOSE_APP = "22"; //TO->"biin_ios"

    var DAY_IN_MILLISECONDS = 24 * 3600 * 1000;
    var functions = {};


    //Get Client List
    functions.index = function (req, res) {
        res.render('dashboard/index', {
            title: 'Dashboard',
            user: req.user,
            organization: req.session.defaultOrganization,
            isSiteManteinance: true
        });
    };

    //Set the information in data base of the user
    functions.set = function (req, res) {
    };

    //Get the information about a dashboard Data
    functions.get = function (req, res) {

        var data = {};

        organization.find({accountIdentifier: req.user.accountIdentifier}, {
            'identifier': 1,
            "name": 1,
            "sites.identifier": 1,
            "sites.title1": 1,
            'sites.biins': 1,
            'elements.elementIdentifier': 1,
            'elements.title': 1
        }, function (err, orgData) {
            if (err)
                throw err;
            else {
                data.organizations = orgData;
                showcase.find({accountIdentifier: req.user.accountIdentifier}, {
                    identifier: 1,
                    name: 1
                }, function (err, showcasesData) {
                    if (err)
                        throw err;
                    else {
                        data.showcases = showcasesData;
                        res.json({data: data});
                    }

                })
            }
        })
    };

    //Get the comprative information data
    functions.getComparativeData = function (req, res) {
        var model = req.body.model;
        var filters = model.filters;

        var query = {};
        if (filters) {
            for (var i = 0; i < filters.length; i++) {
                query[filters[i].name] = filters[i].value;
            }
        }

        query.sessionType = model.compareBy;
        query.accountIdentifier = req.user.accountIdentifier;
        mobileActions.find(query, function (err, data) {
            if (err)
                throw err;
            else {
                var result = {};
                result[model.compareBy] = data;
                res.json({data: result});
            }
        })
    };


    /**GRAPHS AND CHARTS FUNCTIONS**/
    functions.getVisitsReport = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);

        var counterDates = {};
        var currentDate = todayDate;
        for (var i = 0; i < dateRange; i++) {
            currentDate = new Date(todayDate - (i) * DAY_IN_MILLISECONDS);
            counterDates[getDateString(currentDate)] = 0;
        }


        trackingBeacon.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                date: {$gte: startDate, $lt: todayDate},
                $or: [{action: ENTER_BIIN}, {action: ENTER_BIIN_REGION}]
            }
        },
            // Stage 2
            {
                $project: {
                    date : { $add : [ "$date", offset * 60 * -1000] }
                }
            },

            // Stage 3
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$date"}},
                    count: {$sum: 1}
                }
            }

        ], function (error, visitsData) {
            for (var i = 0; i < visitsData.length; i++) {
                counterDates[visitsData[i]._id] = visitsData[i].count;
            }
            res.json(counterDates);
        });
    };

    functions.getNotificationReport = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);

        var counterDates = {};
        var currentDate = todayDate;
        for (var i = 0; i < dateRange; i++) {
            currentDate = new Date(todayDate - (i) * DAY_IN_MILLISECONDS);
            counterDates[getDateString(currentDate)] = 0;
        }

        trackingNotifications.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                date: {$gte: startDate, $lt: todayDate},
                action: BIIN_NOTIFIED
            }
        },
            // Stage 2
            {
                $project: {
                    date : { $add : [ "$date", offset * 60 * -1000] }
                }
            },

            // Stage 3
            {
                $group: {
                    _id: {$dateToString: {format: "%Y-%m-%d", date: "$date"}},
                    count: {$sum: 1}
                }
            }

        ], function (error, notificationData) {
            for (var i = 0; i < notificationData.length; i++) {
                counterDates[notificationData[i]._id] = notificationData[i].count;
            }
            res.json(counterDates);
        });
    };

    function getDateString(date) {
        var dd = date.getUTCDate();
        var mm = date.getUTCMonth() + 1; //January is 0!
        var yyyy = date.getUTCFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        return yyyy + '-' + mm + '-' + dd;
    }

    functions.getNewVisitsLocal = function (req, res) {

    };


    functions.getNewVisitsMobile = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);

        trackingBeacon.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                date: {$gte: startDate, $lt: todayDate}
            }
        },
            {$group: {_id: "$userIdentifier"}}], function (error, visitsData) {

            //getting priorVisits
            trackingBeacon.aggregate([{$match: {organizationIdentifier: organizationId, date: {$lt: startDate}}},
                {$group: {_id: "$userIdentifier"}}], function (error, oldVisitsData) {
                var idUsersVisits = _.pluck(visitsData, '_id');
                var idUsersOldVisits = _.pluck(oldVisitsData, '_id');
                var newVisits = _.difference(idUsersVisits, idUsersOldVisits);
                res.json({data: newVisits.length});
            });
        });
    };

    functions.getTotalBiinedMobile = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);
        trackingBiined.aggregate(
            [{
                $match: {
                    organizationIdentifier: organizationId,
                    date: {$gte: startDate, $lt: todayDate}
                }
            },
                {
                    $group: {
                        _id: null,
                        count: {$sum: 1}
                    }
                }]
        ).exec(function (error, data) {
                if (error) {

                } else {
                    if (data.length == 0)
                        res.json({data: 0});
                    else
                        res.json({data: data[0].count});
                }

            });
    };

    functions.getNewVsReturningMobile = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);
        trackingBeacon.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                date: {$gte: startDate, $lt: todayDate}
            }
        },
            {$group: {_id: "$userIdentifier"}}], function (error, visitsData) {

            //getting priorVisits
            trackingBeacon.aggregate([{$match: {organizationIdentifier: organizationId, date: {$lt: startDate}}},
                {$group: {_id: "$userIdentifier"}}], function (error, oldVisitsData) {
                var idUsersVisits = _.pluck(visitsData, '_id');
                var idUsersOldVisits = _.pluck(oldVisitsData, '_id');
                var newVisits = _.difference(idUsersVisits, idUsersOldVisits);
                var returningVisits = _.intersection(idUsersVisits, idUsersOldVisits);
                res.json({data: {news: newVisits.length, returning: returningVisits.length}});
            });
        });
    };

    functions.getVisitedElementsMobile = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);

        trackingElements.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                date: {$gte: startDate, $lt: todayDate},
                action: ENTER_ELEMENT_VIEW
            }
        },
            {
                $group: {
                    _id: "$userIdentifier",
                    elementsViewed: {$push: "$elementIdentifier"}
                }
            }], function (error, elementsVisitsByUser) {
            var average = 0;
            if (elementsVisitsByUser.length) {
                for (var i = 0; i < elementsVisitsByUser.length; i++) {
                    var distinctElementsViewed = _.uniq(elementsVisitsByUser[i].elementsViewed);
                    average += distinctElementsViewed.length;
                }
                average = average / elementsVisitsByUser.length;
            }
            res.json({data: average});
        });
    };

    functions.getSessionsMobile = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);
        trackingSites.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                date: {$gte: startDate, $lt: todayDate},
                action: ENTER_SITE_VIEW
            }
        },
            {$group: {_id: "$userIdentifier", count: {$sum: 1}}}], function (error, sitesSessions) {
            var sessionCounter = 0;
            for (var i = 0; i < sitesSessions.length; i++) {
                sessionCounter += sitesSessions[i].count;
            }
            res.json({data: sessionCounter});
        });
    };

    functions.getFromVisitsLocal = function (req, res) {

    };

    functions.getSessionsLocal = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);
        var siteId = filters.siteId;
        trackingSites.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                date: {$gte: startDate, $lt: todayDate},
                action: ENTER_SITE_VIEW,
                siteIdentifier: siteId
            }
        },
            {$group: {_id: "$userIdentifier", count: {$sum: 1}}}], function (error, sitesSessions) {
            var sessionCounter = 0;
            for (var i = 0; i < sitesSessions.length; i++) {
                sessionCounter += sitesSessions[i].count;
            }
            res.json({data: sessionCounter});
        });
    };

    functions.getNewVisitsLocal = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var siteId = filters.siteId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);

        trackingBeacon.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                siteIdentifier: siteId,
                date: {$gte: startDate, $lt: todayDate}
            }
        },
            {$group: {_id: "$userIdentifier"}}], function (error, visitsData) {

            //getting priorVisits
            trackingBeacon.aggregate([{
                $match: {
                    organizationIdentifier: organizationId,
                    siteIdentifier: siteId,
                    date: {$lt: startDate}
                }
            },
                {$group: {_id: "$userIdentifier"}}], function (error, oldVisitsData) {
                var idUsersVisits = _.pluck(visitsData, '_id');
                var idUsersOldVisits = _.pluck(oldVisitsData, '_id');
                var newVisits = _.difference(idUsersVisits, idUsersOldVisits);
                res.json({data: newVisits.length});
            });
        });
    };

    functions.getNewVsReturningLocal = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var siteId = filters.siteId;
        var offset =  req.headers.offset || 0;
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "-" : "+";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);
        trackingBeacon.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                siteIdentifier: siteId,
                date: {$gte: startDate, $lt: todayDate}
            }
        },
            {$group: {_id: "$userIdentifier"}}], function (error, visitsData) {

            //getting priorVisits
            trackingBeacon.aggregate([{
                $match: {
                    organizationIdentifier: organizationId,
                    siteIdentifier: siteId,
                    date: {$lt: startDate}
                }
            },
                {$group: {_id: "$userIdentifier"}}], function (error, oldVisitsData) {
                var idUsersVisits = _.pluck(visitsData, '_id');
                var idUsersOldVisits = _.pluck(oldVisitsData, '_id');
                var newVisits = _.difference(idUsersVisits, idUsersOldVisits);
                var returningVisits = _.intersection(idUsersVisits, idUsersOldVisits);
                res.json({data: {news: newVisits.length, returning: returningVisits.length}});
            });
        });
    };


    return functions;
};
