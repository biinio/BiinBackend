module.exports = function(){
	//Schemas
	var mobileUser = require('../schemas/mobileUser'), 
		util = require('util'),
		moment = require('moment'),
		bcrypt = require('bcrypt'),
		utils =require("../biin_modules/utils")();

	var functions ={};

	//PUT a new Mobile User
	functions.set = function(req,res){

		res.setHeader('Content-Type', 'application/json');
		var errors = utils.validate(new mobileUser().validations(),req,'');
		if (errors) {
        	res.send(errors, 400)
    	} else {
			//Get the Body Information
			var firstName = req.body['firsName']
			 ,lastName = req.body['lastName']
			 ,biinName = req.body['biinName']
			 ,password = req.body['password']
			 ,birthDate = req.body['birthDate']
			 ,gender = req.body['gender']
			 ,joinDate = moment().format('YYYY-MM-DD h:mm:ss')
			 ,accountState = 'active';
			 
			mobileUser.findOne({biinName:biinName},function(err,mobileUserAccount){
				if(mobileUserAccount){
					util.inspect(mobileUserAccount,{depth:null});
					res.send('The Account Name is already taken');
				}else{
					bcrypt.hash(password, 11, function (err, hash) {
						var newModel = new mobileUser({
							firsName:firstName,
							lastName:lastName,
							biinName:biinName,
							password:hash,
							birthDate:birthDate,
							gender:gender,
							joinDate:joinDate,
							accountState:accountState
						})
						//Save The Model
						newModel.save(function(err){
							if(err)
								throw err;
							else
								res.send('The user was registered');
						});
			 		});
				}
			});
		}	
	}

	return functions;
}