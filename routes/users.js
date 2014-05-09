module.exports = function(db){
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
		    name: 'epadilla',
		    password: 'epadilla',
		    displayName:'Esteban Padilla'
		});

		// save user to database
		admin.save(function(err) {
			console.log(err);
			console.log('saved');
		});

		res.render('user/create',req.user);	
	}

	return functions;
}

