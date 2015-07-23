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

	var functions ={}


	//Get Client List
	functions.index = function(req,res){
		res.render('dashboard/index', { title: 'Dashboard' ,user:req.user, organization:req.session.defaultOrganization, isSiteManteinance:true});
	}

	//Set the information in data base of the user
	functions.set= function(req,res){
		var dateNow = utils.getDateNow();
		var data=[{
					account:'b7854392-1f7a-496f-bf36-caa2a050b7d6',
					organization:'24974199-011e-4371-914f-c89680e77051',
					showcase:'2067e997-c251-4e35-a4be-9e3a7cc3e204',
					element:'54023aae-19e9-434c-ab10-c08e86e575e0',
					biin:'',
					action:'shared',
					date: dateNow,
					mobileUser:'12345',
					sessionType:'local'
					},
					{
					account:'b7854392-1f7a-496f-bf36-caa2a050b7d6',
					organization:'24974199-011e-4371-914f-c89680e77051',
					showcase:'2067e997-c251-4e35-a4be-9e3a7cc3e204',
					element:'54023aae-19e9-434c-ab10-c08e86e575e0',
					biin:'',
					action:'biined',
					date: dateNow,
					mobileUser:'123453',
					sessionType:'local'
					},
					{
					account:'b7854392-1f7a-496f-bf36-caa2a050b7d6',
					organization:'24974199-011e-4371-914f-c89680e77051',
					showcase:'2067e997-c251-4e35-a4be-9e3a7cc3e204',
					element:'54023aae-19e9-434c-ab10-c08e86e575e0',
					biin:'',
					action:'biined',
					date: dateNow,
					mobileUser:'123453',
					sessionType:'biin'
					}					
					];
		mobileActions.create(data,function(err){
			if(err)
				throw err;
			else
				res.json({'result':1});
		})
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
					for(var i = 0; i < data.length; i++)
					{
						biinsIdentifier.push({"actions.to":data[i].identifier});
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



									if(compressedVisits[actions[i].at+actions[i].whom] == null)
										compressedVisits[actions[i].at+actions[i].whom] = [actions[i]];
									else
									{
										var lastActionIndex = compressedVisits[actions[i].at+actions[i].whom].length-1;
										if(Math.abs(compressedVisits[actions[i].at+actions[i].whom][lastActionIndex].atTime - actions[i].atTime) > 900)
										{
											compressedVisits[actions[i].at+actions[i].whom].push(actions[i]);
											compressedVisits.sort(function(a,b){
												return a.atTime - b.atTime;
											});
										}
									}
								}
								var visits = [];
								var compressedVisitsKeys = Object.keys(compressedVisits);
								for (var i = 0; i < compressedVisitsKeys.length; i++) {
									visits = visits.concat(compressedVisits[compressedVisitsKeys[i]]);
								}
								
								//TODO: change date schema type from string to longInteger
								var datesKeys = Object.keys(counterDates);
								for (i = 0; i < visits.length; i++) 
								{
									if(datesKeys.indexOf(visits[i].at) > -1)
										counterDates[visits[i].at] += 1;
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
					for(var i = 0; i < data.length; i++)
					{
						for (var j = 0; j < data[i].objects.length; j++) {
							objectsIdentifier.push({"actions.to":data[i].objects[j]._id});
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
						mobileHistory.find({$or:objectsIdentifier,"actions.did":"5"},{_id:0,"actions.at":1,"actions.whom":1}).lean().exec(function(errMobile,data)
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



									if(compressedVisits[actions[i].at+actions[i].whom] == null)
										compressedVisits[actions[i].at+actions[i].whom] = [actions[i]];
									else
									{
										var lastActionIndex = compressedVisits[actions[i].at+actions[i].whom].length-1;
										if(Math.abs(compressedVisits[actions[i].at+actions[i].whom][lastActionIndex].atTime - actions[i].atTime) > 900)
										{
											compressedVisits[actions[i].at+actions[i].whom].push(actions[i]);
											compressedVisits.sort(function(a,b){
												return a.atTime - b.atTime;
											});
										}
									}
								}
								var visits = [];
								var compressedVisitsKeys = Object.keys(compressedVisits);
								for (var i = 0; i < compressedVisitsKeys.length; i++) {
									visits = visits.concat(compressedVisits[compressedVisitsKeys[i]]);
								}
								
								//TODO: change date schema type from string to longInteger
								var datesKeys = Object.keys(counterDates);
								for (i = 0; i < visits.length; i++) 
								{
									if(datesKeys.indexOf(visits[i].at) > -1)
										counterDates[visits[i].at] += 1;
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
		var dd = date.getDate();
		var mm = date.getMonth()+1; //January is 0!
		var yyyy = date.getFullYear();

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


	return functions;
}

