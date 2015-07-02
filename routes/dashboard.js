module.exports = function(){

    //Schemas
    var util = require('util'), fs=require('fs');

	//Custom Utils
	var utils = require('../biin_modules/utils')();	    

	var client = require('../schemas/client'), imageManager=require('../biin_modules/imageManager')();
	var organization = require('../schemas/organization');
	var showcase = require('../schemas/showcase')
	var mobileActions= require('../schemas/mobileActions');
	var functions ={}


	//Get Client List
	functions.index = function(req,res){
		res.render('dashboard/index', { title: 'Account' ,user:req.user, organization:req.session.defaultOrganization, isSiteManteinance:true});
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

	}


	function getBeaconsPerSite(){

	}


	return functions;
}

