module.exports = function(db){
	//Packages
    var moment = require('moment');

    //Schemas
	var user = require('../schemas/user');
	var functions ={}

	//Get User List
	functions.index = function(req,res){
		res.render('user/index',req.user);		
	}

	//Get User Creates
	functions.createView = function(req,res){
		res.render('user/create',req.user);
	}

	//Post Creation of a User
	functions.create = function(req,res){
		// create a user a new user
		var admin = new user({
		    name: 'epadilla@biinapp.com',
		    password: 'abc1236',
		    displayName:'Esteban Padilla',
		    accountIdentifier:'1002',
		    emails:['epadilla@biinapp.com']
		});

		// save user to database
		admin.save(function(err) {
			console.log(err);
			console.log('saved');
		});

		res.render('user/create',req.user);	
	}

	//Logout the user
	functions.logout = function(req,res){
		req.session.destroy();
		req.logout();
		res.redirect('/');
	}
	return functions;
}

