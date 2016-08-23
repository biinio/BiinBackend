//Schemas
var util = require('util');
var fs = require('fs');
var _ = require('underscore');
//Custom Utils
var utils = require('../utils.server.controller');

var client = require('../../models/client');
var organization = require('../../models/organization');
var biin = require('../../models/biin');
var visits = require('../../models/visits');
var cards = require('../../models/cards');
var cardsPerBiinie = require('../../models/cardsPerBiinie');
var mobileUsers = require('../../models/mobileUser');


//Tracking schemas
var trackingBeacon = require('../../models/trackingbeacon'),
    trackingSites = require('../../models/trackingsites'),
    trackingBiined = require('../../models/trackingbiined'),
    trackingShares = require('../../models/trackingshares'),
    trackingNotifications = require('../../models/trackingnotifications');

var actionsEnum = require('../enums/actionsenum');

var DAY_IN_MILLISECONDS = 24 * 3600 * 1000;

/**GRAPHS AND CHARTS FUNCTIONS**/
exports.getVisitsReport = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var siteId = filters.siteId;
    var offset = req.headers.offset || 0;
    offset = parseInt(offset);
    var nowDate = new Date();

    var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
    var startDate = new Date(todayDate - dateRange * DAY_IN_MILLISECONDS);

    var timezoneSymbol = offset < 0 ? "+" : "-";
    var hourTimezone = Math.abs(Math.trunc(offset / 60)) < 10 ? "0" + Math.abs(Math.trunc(offset / 60)) : Math.abs(Math.trunc(offset / 60)) + "";
    var minuteTimezone = Math.abs(offset % 60) < 10 ? "0" + Math.abs(offset % 60) : Math.abs(offset % 60);

    var todayStringDate = getDateString(todayDate) + "T23:59:59.999" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;
    var startStringDate = getDateString(startDate) + "T00:00:00.000" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;

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
            siteIdentifier: siteId,
            date: {$gte: startDate, $lt: todayDate},
            $or: [{action: actionsEnum.ENTER_BIIN}, {action: actionsEnum.ENTER_BIIN_REGION}]
        }
    },
        // Stage 2
        {
            $project: {
                date: {$add: ["$date", offset * 60 * -1000]}
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

exports.getNotificationReport = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var siteId = filters.siteId;
    var offset = req.headers.offset || 0;
    offset = parseInt(offset);
    var nowDate = new Date();

    var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
    var startDate = new Date(todayDate - dateRange * DAY_IN_MILLISECONDS);

    var timezoneSymbol = offset < 0 ? "+" : "-";
    var hourTimezone = Math.abs(Math.trunc(offset / 60)) < 10 ? "0" + Math.abs(Math.trunc(offset / 60)) : Math.abs(Math.trunc(offset / 60)) + "";
    var minuteTimezone = Math.abs(offset % 60) < 10 ? "0" + Math.abs(offset % 60) : Math.abs(offset % 60);

    var todayStringDate = getDateString(todayDate) + "T23:59:59.999" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;
    var startStringDate = getDateString(startDate) + "T00:00:00.000" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;

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
            siteIdentifier: siteId,
            date: {$gte: startDate, $lt: todayDate},
            action: actionsEnum.BIIN_NOTIFIED
        }
    },
        // Stage 2
        {
            $project: {
                date: {$add: ["$date", offset * 60 * -1000]}
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

exports.getTotalBiinedMobile = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var offset = req.headers.offset || 0;
    offset = parseInt(offset);
    var nowDate = new Date();

    var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
    var startDate = new Date(todayDate - dateRange * DAY_IN_MILLISECONDS);

    var timezoneSymbol = offset < 0 ? "+" : "-";
    var hourTimezone = Math.abs(Math.trunc(offset / 60)) < 10 ? "0" + Math.abs(Math.trunc(offset / 60)) : Math.abs(Math.trunc(offset / 60)) + "";
    var minuteTimezone = Math.abs(offset % 60) < 10 ? "0" + Math.abs(offset % 60) : Math.abs(offset % 60);

    var todayStringDate = getDateString(todayDate) + "T23:59:59.999" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;
    var startStringDate = getDateString(startDate) + "T00:00:00.000" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;

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

exports.getTotalSharedMobile = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var siteId = filters.siteId;
    var offset = req.headers.offset || 0;
    offset = parseInt(offset);
    var nowDate = new Date();

    var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
    var startDate = new Date(todayDate - dateRange * DAY_IN_MILLISECONDS);

    var timezoneSymbol = offset < 0 ? "+" : "-";
    var hourTimezone = Math.abs(Math.trunc(offset / 60)) < 10 ? "0" + Math.abs(Math.trunc(offset / 60)) : Math.abs(Math.trunc(offset / 60)) + "";
    var minuteTimezone = Math.abs(offset % 60) < 10 ? "0" + Math.abs(offset % 60) : Math.abs(offset % 60);

    var todayStringDate = getDateString(todayDate) + "T23:59:59.999" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;
    var startStringDate = getDateString(startDate) + "T00:00:00.000" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;

    todayDate = new Date(todayStringDate);
    startDate = new Date(startStringDate);
    trackingShares.aggregate(
        [{
            $match: {
                organizationIdentifier: organizationId,
                siteIdentifier: siteId,
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

exports.getNewVsReturningMobile = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var offset = req.headers.offset || 0;
    var siteId = filters.siteId;
    offset = parseInt(offset);
    var nowDate = new Date();

    var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
    var startDate = new Date(todayDate - dateRange * DAY_IN_MILLISECONDS);

    var timezoneSymbol = offset < 0 ? "+" : "-";
    var hourTimezone = Math.abs(Math.trunc(offset / 60)) < 10 ? "0" + Math.abs(Math.trunc(offset / 60)) : Math.abs(Math.trunc(offset / 60)) + "";
    var minuteTimezone = Math.abs(offset % 60) < 10 ? "0" + Math.abs(offset % 60) : Math.abs(offset % 60);

    var todayStringDate = getDateString(todayDate) + "T23:59:59.999" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;
    var startStringDate = getDateString(startDate) + "T00:00:00.000" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;

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
        {$group: {_id: "$userIdentifier", count: {$sum: 1}}}], function (error, visitsData) {
        var newVisits = 0;
        var returningVisits = 0;

        for (var i = 0; i < visitsData.length; i++) {
            var visit = visitsData[i];
            newVisits++;
            returningVisits += (visit.count - 1);
        }
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
            res.json({
                data: {
                    news: newVisits,
                    returning: returningVisits,
                    totalSessions: sessionCounter
                }
            });
        });


    });
};

exports.getNewVsReturningLocal = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var siteId = filters.siteId;
    var offset = req.headers.offset || 0;
    offset = parseInt(offset);
    var nowDate = new Date();

    var todayDate = new Date(nowDate.getTime() + (offset * 60 * 1000));
    var startDate = new Date(todayDate - dateRange * DAY_IN_MILLISECONDS);

    var timezoneSymbol = offset < 0 ? "+" : "-";
    var hourTimezone = Math.abs(Math.trunc(offset / 60)) < 10 ? "0" + Math.abs(Math.trunc(offset / 60)) : Math.abs(Math.trunc(offset / 60)) + "";
    var minuteTimezone = Math.abs(offset % 60) < 10 ? "0" + Math.abs(offset % 60) : Math.abs(offset % 60);

    var todayStringDate = getDateString(todayDate) + "T23:59:59.999" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;
    var startStringDate = getDateString(startDate) + "T00:00:00.000" + timezoneSymbol + hourTimezone + ":" + minuteTimezone;

    todayDate = new Date(todayStringDate);
    startDate = new Date(startStringDate);
    trackingBeacon.aggregate([{
        $match: {
            organizationIdentifier: organizationId,
            siteIdentifier: siteId,
            date: {$gte: startDate, $lt: todayDate}
        }
    },
        {$group: {_id: "$userIdentifier", count: {$sum: 1}}}], function (error, visitsData) {
        var newVisits = 0;
        var returningVisits = 0;

        for (var i = 0; i < visitsData.length; i++) {
            var visit = visitsData[i];
            newVisits++;
            returningVisits += (visit.count - 1);
        }


        trackingBeacon.aggregate([
            {
                $match: {
                    organizationIdentifier: organizationId,
                    siteIdentifier: siteId,
                    date: {$gte: startDate, $lt: todayDate},
                    $or: [{action: actionsEnum.ENTER_BIIN}, {action: actionsEnum.ENTER_BIIN_REGION}]
                }
            },
            // Stage 2
            {
                $project: {
                    date: {$add: ["$date", offset * 60 * -1000]}
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
            var sessionCounter = 0;
            for (var i = 0; i < visitsData.length; i++) {
                sessionCounter += visitsData[i].count;
            }
            res.json({
                data: {
                    news: newVisits,
                    returning: returningVisits,
                    totalSessions: sessionCounter
                }
            });
        });
    });
};

exports.getloyaltyCardDashboard = function (req, res) {
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var siteId = filters.siteId;
    var offset = req.headers.offset || 0;
    offset = parseInt(offset);

    cards.findOne({organizationIdentifier: organizationId, isActive: true, isDeleted:false}, {
        _id: 1,
        identifier: 1,
        isUnlimited: 1,
        goal: 1,
        rule: 1,
        title: 1,
        quantity:1,
        amountAssigned:1,
        gift:1,
        slots:1
    })
        .populate("gift")
        .exec(function (err, card) {
            if (err) {
                res.status(500).json(err);
            } else if (card) {
                cardsPerBiinie.find({card: card._id}, {userIdentifier:1, usedSlots:1, card:1}).lean().exec(function (err, cardPerBiinie) {
                    if (err) {
                        res.status(500).json(err);
                    } else {
                        var idBiinies = _.map(cardPerBiinie, "userIdentifier");
                        mobileUsers.find({identifier: {$in: idBiinies}}, { identifier:1, firstName:1,lastName:1, biinName:1, email:1, facebookAvatarUrl:1}).lean().exec(function (err, biinies) {
                            if (err) {
                                res.status(500).json(err);
                            } else {
                                for (var i = 0; i < cardPerBiinie.length; i++) {
                                    var tempCard = cardPerBiinie[i];
                                    let biinie = _.findWhere(biinies, {identifier: tempCard.userIdentifier});
                                    tempCard.biinie = biinie;
                                    cardPerBiinie[i] = tempCard;
                                }
                                res.json({
                                        activeCard: card,
                                        usersCard: cardPerBiinie
                                    }
                                )
                            }
                        });
                    }
                })
            } else {
                res.json(
                    {
                        activeCard: {},
                        usersCard: []
                    }
                )
            }
        })
};

