module.exports = function () {

    //Schemas
    var util = require('util'), fs = require('fs');
    var _ = require('underscore');
    //Custom Utils
    var utils = require('../biin_modules/utils')();

    var client = require('../schemas/client');
    var organization = require('../schemas/organization');
    var biin = require('../schemas/biin');
    var visits = require('../schemas/visits');

    //Tracking schemas
    var trackingBeacon = require('../schemas/trackingbeacon'),
        //trackingFollow = require('../schemas/trackingfollows'),
        trackingSites = require('../schemas/trackingsites'),
        //trackingLikes = require('../schemas/trackinglikes'),
        //trackingElements = require('../schemas/trackingelements'),
        trackingBiined = require('../schemas/trackingbiined'),
        trackingShares = require('../schemas/trackingshares'),
        trackingNotifications = require('../schemas/trackingnotifications');

    var actionsEnum = require('../biin_modules/actionsenum');

    var DAY_IN_MILLISECONDS = 24 * 3600 * 1000;
    var functions = {};

    /**GRAPHS AND CHARTS FUNCTIONS**/
    functions.getVisitsReport = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var siteId = filters.siteId;
        var offset =  req.headers.offset || 0;
        offset = parseInt(offset);
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "+" : "-";
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
                siteIdentifier:siteId,
                date: {$gte: startDate, $lt: todayDate},
                $or: [{action: actionsEnum.ENTER_BIIN}, {action: actionsEnum.ENTER_BIIN_REGION}]
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
        var siteId = filters.siteId;
        var offset =  req.headers.offset || 0;
        offset = parseInt(offset);
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "+" : "-";
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
                siteIdentifier:siteId,
                date: {$gte: startDate, $lt: todayDate},
                action: actionsEnum.BIIN_NOTIFIED
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

    functions.getTotalBiinedMobile = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var offset =  req.headers.offset || 0;
        offset = parseInt(offset);
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "+" : "-";
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

    functions.getTotalSharedMobile = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var siteId = filters.siteId;
        var offset =  req.headers.offset || 0;
        offset = parseInt(offset);
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "+" : "-";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);
        trackingShares.aggregate(
            [{
                $match: {
                    organizationIdentifier: organizationId,
                    siteIdentifier:siteId,
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
        var siteId = filters.siteId;
        offset = parseInt(offset);
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "+" : "-";
        var hourTimezone =  Math.abs(Math.trunc(offset/60)) < 10 ? "0" + Math.abs(Math.trunc(offset/60)) : Math.abs(Math.trunc(offset/60)) + "";
        var minuteTimezone = Math.abs(offset%60) < 10? "0"+Math.abs(offset%60): Math.abs(offset%60);

        var todayStringDate = getDateString(todayDate)+"T23:59:59.999"+timezoneSymbol+hourTimezone+":"+minuteTimezone;
        var startStringDate = getDateString(startDate)+"T00:00:00.000"+timezoneSymbol+hourTimezone+":"+minuteTimezone;

        todayDate = new Date(todayStringDate);
        startDate = new Date(startStringDate);
        trackingSites.aggregate([{
            $match: {
                organizationIdentifier: organizationId,
                siteIdentifier: siteId,
                date: {$gte: startDate, $lt: todayDate},
                action: actionsEnum.ENTER_SITE_VIEW
            }
        },
            {$group: {_id: "$userIdentifier"}}], function (error, visitsData) {

            //getting priorVisits
            trackingSites.aggregate([{$match: {organizationIdentifier: organizationId,siteIdentifier: siteId, date: {$lt: startDate}}},
                {$group: {_id: "$userIdentifier"}}], function (error, oldVisitsData) {
                var idUsersVisits = _.pluck(visitsData, '_id');
                var idUsersOldVisits = _.pluck(oldVisitsData, '_id');
                var newVisits = _.difference(idUsersVisits, idUsersOldVisits);
                var returningVisits = _.intersection(idUsersVisits, idUsersOldVisits);
                trackingSites.aggregate([{
                    $match: {
                        organizationIdentifier: organizationId,
                        siteIdentifier: siteId,
                        date: {$gte: startDate, $lt: todayDate},
                        action: actionsEnum.ENTER_SITE_VIEW
                    }
                },
                    {$group: {_id: "$userIdentifier", count: {$sum: 1}}}], function (error, sitesSessions) {
                    var sessionCounter = 0;
                    for (var i = 0; i < sitesSessions.length; i++) {
                        sessionCounter += sitesSessions[i].count;
                    }
                    res.json({data: {news: newVisits.length, returning: returningVisits.length, totalSessions:sessionCounter}});
                });




            });
        });
    };

    functions.getNewVsReturningLocal = function (req, res) {
        var filters = JSON.parse(req.headers.filters);
        var dateRange = filters.dateRange;
        var organizationId = filters.organizationId;
        var siteId = filters.siteId;
        var offset =  req.headers.offset || 0;
        offset = parseInt(offset);
        var nowDate = new Date();

        var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
        var startDate = new Date(todayDate -dateRange * DAY_IN_MILLISECONDS);

        var timezoneSymbol = offset < 0 ? "+" : "-";
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
                trackingSites.aggregate([{
                    $match: {
                        organizationIdentifier: organizationId,
                        date: {$gte: startDate, $lt: todayDate},
                        action: actionsEnum.ENTER_SITE_VIEW,
                        siteIdentifier: siteId
                    }
                },
                    {$group: {_id: "$userIdentifier", count: {$sum: 1}}}], function (error, sitesSessions) {
                    var sessionCounter = 0;
                    for (var i = 0; i < sitesSessions.length; i++) {
                        sessionCounter += sitesSessions[i].count;
                    }

                    res.json({data: {news: newVisits.length, returning: returningVisits.length, totalSessions:sessionCounter}});
                });



            });
        });
    };

    return functions;
};
