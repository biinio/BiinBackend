/**
 * Created by Ivan on 7/29/16.
 */
"use strict";

var organizations = require('../../models/organization');
var notices = require('../../models/notices');
var giftsPerBiinie = require('../../models/giftsPerBiinie');
var gifts = require('../../models/gifts');
var giftEnum = require('../enums/giftstatusenum');
var _ = require('underscore');
var moment = require('moment');

var notificationsManager = require('../notifications.server.controller');

exports.onEnterSite = function (req, res) {
    var biinnieId = req.params.biinieIdentifier;
    var siteId = req.params.siteIdentifier;
    var clientTime = req.body.model.timeClient;
    clientTime = clientTime.replace(/ +/g, "");
    clientTime = new Date(clientTime);

    function checkNotices( result, userId, noticesId, clientTime ){

        return new Promise( function( resolve, reject ) {
            if(!result.wasNotificationSent){
                notices.find({identifier:{$in:noticesId}, isDeleted: false, isActive:true},{},function(err,noticesFound){
                    if(err){
                        resolve({wasNotificationSent: false});
                    } else {
                        let noticesFilteredByDay = _.filter(noticesFound,function ( notice ) {
                            return (notice.onSunday == "1" && clientTime.getDay() == 0) ||
                                (notice.onMonday == "1" && clientTime.getDay() == 1) ||
                                (notice.onTuesday == "1" && clientTime.getDay() == 2) ||
                                (notice.onWednesday == "1" && clientTime.getDay() == 3) ||
                                (notice.onThursday == "1" && clientTime.getDay() == 4) ||
                                (notice.onFriday == "1" && clientTime.getDay() == 5) ||
                                (notice.onSaturday == "1" && clientTime.getDay() == 6);

                        });
                        let noticesFilteredByHour = _.filter(noticesFilteredByDay,function (notice) {
                            return parseFloat(notice.startTime) < parseFloat(clientTime.getHours() + (clientTime.getMinutes()/60))  && notice.endTime > parseFloat(clientTime.getHours() + (clientTime.getMinutes()/60));
                        });

                        let noticesSortedByClosestTime = _.sortBy(noticesFilteredByHour, function( notice ){
                            let noticeStartTime = parseFloat(notice.startTime);
                            let noticeEndTime = parseFloat(notice.endTime);
                            return noticeEndTime - noticeStartTime;
                        });

                        if(noticesSortedByClosestTime.length > 0 ){
                            let dataContainer = {};
                            dataContainer.data = {};
                            dataContainer.data.type = "notice";
                            notificationsManager.sendToUser(userId,"",noticesSortedByClosestTime[0].message,null,null, dataContainer ).then(function(){
                                resolve({wasNotificationSent:true});
                            }).catch(function () {
                                resolve({wasNotificationSent:false});
                            });
                        } else {
                            resolve({wasNotificationSent: false });
                        }
                    }
                });
            } else {
                resolve({wasNotificationSent: true});
            }
        });
    }

    function checkGifts( userId, siteId, organization ){

        return new Promise( function( resolve, reject) {
            let organizationName = organization.brand;
            giftsPerBiinie.find({biinieIdentifier:biinnieId, status:giftEnum.SENT},{},function (err,giftsFound) {
                if(err){
                    resolve({wasNotificationSent:false});
                }else{
                    gifts.find({sites: siteId, isDeleted:false, isActive:true },{},function (err, giftsMetaData) {
                        if(err){
                            resolve({wasNotificationSent:false});
                        } else {
                            if(giftsMetaData){
                                let giftsMetaDataID = _.map(giftsMetaData,"identifier");

                                let shouldSendNotification = _.filter(giftsFound, function (giftBiinie) {
                                        return  giftsMetaDataID.indexOf(giftBiinie.gift.identifier) > -1
                                    }).length > 0;

                                if(shouldSendNotification){
                                    let dataContainer = {};
                                    dataContainer.data = {};
                                    dataContainer.data.type = "giftreminder";
                                    notificationsManager.sendToUser(userId,"Un regalo de " + organizationName, "Tienes un regalo por reclamar en " + organizationName,null,null,dataContainer).then(function() {
                                        resolve({wasNotificationSent: true});
                                    }).catch(function(){
                                        resolve({wasNotificationSent:false});
                                    });
                                } else {
                                    resolve({wasNotificationSent: false});
                                }
                            }else{
                                resolve({wasNotificationSent:false});
                            }
                        }
                    });
                }
            });
        });
    }


    organizations.findOne({"sites.identifier":siteId},{},function (err,organization) {
        if(err){
            res.json({data: {}, status: "1", result: "0"});
        } else {
            if(organization){
                var site = _.findWhere(organization.sites,{identifier:siteId});
                checkGifts(biinnieId,siteId,organization).then(function (result) {
                    return checkNotices(result, biinnieId, site.notices, clientTime);
                },function (err) {
                    console.log(err);
                    res.json({data: {}, status: "1", result: "0"});
                    console.log("error on gifts");
                }).then(function () {
                    res.json({data: {}, status: "0", result: "1"});
                },function (err) {
                    console.log("error on notices");
                    res.json({data: {}, status: "2", result: "0"});
                });
            }else{
                res.json({data: {}, status: "3", result: "0"});
            }
        }
    });



    /*function checkCards(){
        return new Promise( function( resolve, reject){

        });
    }*/
};


exports.onExitSite = function (req, res) {
    res.json({data: {}, status: "0", result: "1"});
};