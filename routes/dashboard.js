module.exports = function(){

    //Schemas
    var util = require('util'), fs=require('fs');

	//Custom Utils
	var utils = require('../biin_modules/utils')();

	var client = require('../schemas/client'), imageManager=require('../biin_modules/imageManager')();
	var organization = require('../schemas/organization');
	var showcase = require('../schemas/showcase')
	var mobileActions= require('../schemas/mobileActions');
	var mobileHistory= require('../schemas/mobileHistory');
	var biin= require('../schemas/biin');
	var visits = require('../schemas/visits');

  //Tracking schemas
	//var trackingBeacon = require('../schemas/trackingBeacon'),
	var	trackingFollow = require('../schemas/trackingFollows'),
		trackingSites = require('../schemas/trackingSites'),
		trackingLikes = require('../schemas/trackingLikes'),
		trackingElements = require('../schemas/trackingElements'),
		trackingBiined = require('../schemas/trackingBiined');

var ENTER_BIIN_REGION  = "1";
var EXIT_BIIN_REGION  = "2";
var ENTER_BIIN  = "3";
var EXIT_BIIN  = "4";
var VIEWED_ELEMENT  = "5";
var BIIN_NOTIFIED  = "6";
var NOTIFICATION_OPENED  = "7";
var ENTER_SITE_VIEW   = "8";
var LEAVE_SITE_VIEW   = "9";
var ENTER_ELEMENT_VIEW   = "10";
var LEAVE_ELEMENT_VIEW   = "11";
var BIINED_ELEMENT  = "12";
var BIINED_SITE  = "13";
var LIKE_SITE = "14";
var UNLIKE_SITE = "15";
var FOLLOW_SITE = "16";
var UNFOLLOW_SITE = "17";

	var functions ={}


	//Get Client List
	functions.index = function(req,res){
		res.render('dashboard/index', { title: 'Dashboard' ,user:req.user, organization:req.session.defaultOrganization, isSiteManteinance:true});
	}

	//Set the information in data base of the user
	functions.set= function(req,res){
	}

	//Get the information about a dashboard Data
	functions.get=function(req,res){

		var data={};

		organization.find({accountIdentifier:req.user.accountIdentifier},{'identifier':1,"name":1,"sites.identifier":1,"sites.title1":1,'sites.biins':1,'elements.elementIdentifier':1,'elements.title':1},function(err, orgData){
			if(err)
				throw err;
			else{
				data.organizations = orgData;
				showcase.find({accountIdentifier:req.user.accountIdentifier},{identifier:1,name:1},function(err,showcasesData){
					if(err)
						throw err;
					else{
						data.showcases = showcasesData;
						res.json({data:data});
					}

				})
			}
		})
	}

	//Get the comprative information data
	functions.getComparativeData=function(req,res){
		var model= req.body.model;
		var filters = model.filters;

		var query ={};
		if(filters){
			for(var i =0; i<filters.length;i++){
				query[filters[i].name]= filters[i].value;
			}
		}

		query.sessionType = model.compareBy;
		query.accountIdentifier = req.user.accountIdentifier;
		mobileActions.find(query,function(err,data){
			if(err)
				throw err;
			else{
				var result ={};
				result[model.compareBy] = data;
				res.json({data:result});
			}
		})
	}


	/**GRAPHS AND CHARTS FUNCTIONS**/
	functions.getVisitsReport =function(req, res){
		var organizationId = req.headers["organizationid"];
		var startDate = new Date(req.headers["startdate"]);
		var endDate = new Date(req.headers["enddate"]);
		if(startDate.getTime()<endDate.getTime()){
			biin.find({organizationIdentifier:organizationId, biinType:"2"},{identifier:1}).lean().exec(function(err,data){
				if(err)
					throw err
				else
				{
					var biinsIdentifier = [];
					var projectionbiinsIdentifier = [];
					for(var i = 0; i < data.length; i++)
					{
						biinsIdentifier.push({"actions.to":data[i].identifier});
						projectionbiinsIdentifier.push({"to":data[i].identifier});

					}
					var counterDates = {};
					var currentDate = new Date();
					currentDate.setTime(startDate.getTime())
					for(var i = 0; currentDate.getTime() <= endDate.getTime() ; i++)
					{
						counterDates[getDateString(currentDate)] = 0;
						currentDate.setTime( startDate.getTime() + i * 86400000 );
					}
					if(biinsIdentifier.length == 0)
					{
						res.json({"data":counterDates});
					}
					else
					{
						mobileHistory.find( {$and:[{$or:biinsIdentifier},{$or:[{"actions.did":"3"},{"actions.did":"1"}]}]},
							{actions:{ $elemMatch :{$and:[{$or:projectionbiinsIdentifier},{$or:[{"did":"3"},{"did":"1"}]}]}}, _id:0,"actions.at":1,"actions.whom":1}).lean().exec(function(errMobile,data)
						{
							if(errMobile)
								throw errMobile
							else
							{
								var actions = [];
								var compressedVisits = [];
								for (var i = 0; i < data.length; i++) {
									if(data[i].actions)
										actions = actions.concat(data[i].actions);
								}
								/*for (var i = 0; i < actions.length; i++) {

									var date = actions[i].at.split(" ")[0];
									var time = actions[i].at.split(" ")[1];
									var hours = time.split(":")[0];
									var minutes = time.split(":")[1];
									var seconds = time.split(":")[2];

									var totalSeconds = parseInt(hours) * 3600;
									totalSeconds += parseInt(minutes) * 60;
									totalSeconds += seconds;



									actions[i].at = actions[i].at.split(" ")[0];
									actions[i].atTime = totalSeconds;



									if(compressedVisits[actions[i].at+actions[i].whom] == null)
										compressedVisits[actions[i].at+actions[i].whom] = [actions[i]];
									else
									{
										var lastActionIndex = compressedVisits[actions[i].at+actions[i].whom].length-1;
										if(Math.abs(compressedVisits[actions[i].at+actions[i].whom][lastActionIndex].atTime - actions[i].atTime) > 3600)
										{
											compressedVisits[actions[i].at+actions[i].whom].push(actions[i]);
											compressedVisits[actions[i].at+actions[i].whom].sort(function(a,b){
												return a.atTime - b.atTime;
											});
										}
									}
								}
								var visits = [];
								var compressedVisitsKeys = Object.keys(compressedVisits);
								for (var i = 0; i < compressedVisitsKeys.length; i++) {
									visits = visits.concat(compressedVisits[compressedVisitsKeys[i]]);
								}*/

								for (i = 0; i < actions.length; i++)
								{
									actions[i].at = actions[i].at.indexOf("T") == -1 ?  actions[i].at.split(" ")[0] : actions[i].at.split("T")[0];
								};


								//TODO: change date schema type from string to longInteger
								var datesKeys = Object.keys(counterDates);
								for (i = 0; i < actions.length; i++)
								{
									if(datesKeys.indexOf(actions[i].at) > -1)
										counterDates[actions[i].at] += 1;
								};
								res.json({"data":counterDates});
							}
						});
					}
				}

			});
		}
		else
		{
			res.json({"data":[]});
		}
	}

	functions.getNotificationReport =function(req, res){
		var organizationId = req.headers["organizationid"];
		var startDate = new Date(req.headers["startdate"]);
		var endDate = new Date(req.headers["enddate"]);
		if(startDate.getTime()<endDate.getTime()){
			biin.find({organizationIdentifier:organizationId, biinType:"1"},{"objects._id":1}).lean().exec(function(err,data){
				if(err)
					throw err
				else
				{
					var objectsIdentifier = [];
					var projectionbiinsIdentifier = [];
					for(var i = 0; i < data.length; i++)
					{
						for (var j = 0; j < data[i].objects.length; j++) {
							objectsIdentifier.push({"actions.to":data[i].objects[j]._id});
							projectionbiinsIdentifier.push({"to":data[i].objects[j]._id});
						};
					}
					var counterDates = {};
					var currentDate = new Date();
					currentDate.setTime(startDate.getTime())
					for(var i = 0; currentDate.getTime() <= endDate.getTime() ; i++)
					{
						counterDates[getDateString(currentDate)] = 0;
						currentDate.setTime( startDate.getTime() + i * 86400000 );
					}
					if(objectsIdentifier.length == 0)
					{
						res.json({"data":counterDates});
					}
					else
					{
						mobileHistory.find({$and:[{$or:objectsIdentifier},{"actions.did":"5"}]},
							{ actions:{ $elemMatch :{$and:[{$or:projectionbiinsIdentifier},{$or:[{"did":"5"}]}]}},_id:0,"actions.at":1,"actions.whom":1}).lean().exec(function(errMobile,data)
						{
							if(errMobile)
								throw errMobile
							else
							{
								var actions = [];
								var compressedVisits = [];

								for (var i = 0; i < data.length; i++) {
									if(data[i].actions)
										actions = actions.concat(data[i].actions);
								}
								var visits = [];
								console.log(actions);
								for (i = 0; i < actions.length; i++)
								{
									console.log(actions[i]);
									actions[i].at = actions[i].at.indexOf("T") == -1 ?  actions[i].at.split(" ")[0] : actions[i].at.split("T")[0];
								}
								//TODO: change date schema type from string to longInteger
								var datesKeys = Object.keys(counterDates);
								for (i = 0; i < actions.length; i++)
								{
									if(datesKeys.indexOf(actions[i].at) > -1)
										counterDates[actions[i].at] += 1;
								};
								res.json({"data":counterDates});
							}
						});
					}
				}

			});
		}
		else
		{
			res.json({"data":[]});
		}
	}

	function getDateString(date)
	{
		var dd = date.getUTCDate();
		var mm = date.getUTCMonth()+1; //January is 0!
		var yyyy = date.getUTCFullYear();

		if(dd<10) {
    		dd='0'+dd
		}

		if(mm<10) {
    		mm='0'+mm
		}

		var stringDate = yyyy+'-'+mm+'-'+dd;
		return stringDate;
	}


	function getBeaconsPerSite(){

	}

	functions.getNewVisitsLocal = function(req, res){
		var organizationId = req.headers["organizationid"];
		var dataVisits = {};

		dataVisits.newVisits = 0;
		dataVisits.returningVisits = 0;
		biin.find({organizationIdentifier:organizationId, biinType:"2"},{identifier:1}).lean().exec(function(err,data){
			if(err)
				throw err
			else
			{
				var biinsIdentifier = [];
				for(var i = 0; i < data.length; i++)
				{
					biinsIdentifier.push({"actions.to":data[i].identifier});
				}
				if(biinsIdentifier.length == 0)
				{
					res.json({"data":dataVisits});
					return;
				}
				else
				{
					mobileHistory.find({$or:biinsIdentifier,$or:[{"actions.did":"3"},{"actions.did":"1"}]},{_id:0,"actions.at":1,"actions.whom":1}).lean().exec(function(errMobile,data)
					{
						if(errMobile)
							throw errMobile
						else
						{

							var actions = [];
							var compressedVisits = [];
							for (var i = 0; i < data.length; i++) {
								actions = actions.concat(data[i].actions);
							}
							for (var i = 0; i < actions.length; i++) {

								var date = actions[i].at.split(" ")[0];
								var time = actions[i].at.split(" ")[1];
								var hours = time.split(":")[0];
								var minutes = time.split(":")[1];
								var seconds = time.split(":")[2];

								var totalSeconds = parseInt(hours) * 3600;
								totalSeconds += parseInt(minutes) * 60;
								totalSeconds += seconds;

								actions[i].at = actions[i].at.split(" ")[0];
								actions[i].atTime = totalSeconds;

								if(compressedVisits[actions[i].whom] == null)
									compressedVisits[actions[i].whom] = [actions[i]];
								else
								{
									var lastActionIndex = compressedVisits[actions[i].whom].length-1;
									if(Math.abs(compressedVisits[actions[i].whom][lastActionIndex].atTime - actions[i].atTime) > 900)
									{
										compressedVisits[actions[i].whom].push(actions[i]);
									}
								}
							}
							var compressedVisitorsKeys = Object.keys(compressedVisits);
							for (var i = 0; i < compressedVisitorsKeys.length; i++) {
								if(compressedVisits[compressedVisitorsKeys[i]].length == 1)
									dataVisits.newVisits++;
								else
									dataVisits.returningVisits++;
							};

							res.json({"data":dataVisits});
						}
					});
				}
			}

		});
	}


  functions.getSessionsMobile = function(req, res){
    res.json({data:2});
	}
  functions.getNewVisitsMobile = function(req, res){
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var todayDate = new Date();
    var startDate = new Date(Date.now() + -dateRange*24*3600*1000);

    trackingBiined.aggregate(
      [{
        $match:{
          organizationIdentifier:organizationId,
          date:{$gte: startDate, $lt:todayDate}
        }
      },
      {
        $group:{
          _id:null,
          count: {$sum: 1}
        }
      }]
      ).exec(function(error,data){
        res.json({data:data[0].count});
      });
  }
  functions.getTotalBiinedMobile = function(req, res){
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var todayDate = new Date();
    var startDate = new Date(Date.now() + -dateRange*24*3600*1000);
    trackingBiined.aggregate(
      [{
        $match:{
          organizationIdentifier:organizationId,
          date:{$gte: startDate, $lt:todayDate}
        }
      },
      {
        $group:{
          _id:null,
          count: {$sum: 1}
        }
      }]
      ).exec(function(error,data){
        res.json({data:data[0].count});
      });
	}
  functions.getVisitedElementsMobile = function(req, res){
    res.json({data:35});
	}
  functions.getNewVsReturningMobile = function(req, res){
    var filters = JSON.parse(req.headers.filters);
    var dateRange = filters.dateRange;
    var organizationId = filters.organizationId;
    var todayDate = new Date();
    var startDate = new Date(Date.now() + -dateRange*24*3600*1000);
    trackingBeacon.aggregate(
      [{
        $match:{
          organizationIdentifier:organizationId,
          date:{$gte: startDate, $lt:todayDate}
        }
      },
      {
        $group:{
          _id:{userIdentifier:1},
          count: {$sum: 1}
        }
      }],
      function(error,data){
        res.json({data:data[0].count});
      });
	}

  functions.getSessionsLocal = function(req, res){
    res.json({data:112});
	}
  functions.getNewVisitsLocal = function(req, res){
    res.json({data:62});
	}
  functions.getFromVisitsLocal = function(req, res){
	}
  functions.getNewVsReturningLocal = function(req, res){
    res.json({data:{news:12,returning:4}});
	}
	return functions;
}
