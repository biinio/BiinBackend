module.exports = function(db){

    //Schemas
	var client = require('../schemas/client');
	var functions ={}

	//Get Client List
	functions.index = function(req,res){
		res.render('client/index',req.user);		
	}

	//Get Client Creates
	functions.createView = function(req,res){
		res.render('client/create',req.client);
	}

	//Post Creation of a Client
	functions.create = function(req,res){
		// create a Client
		/*var admin = new client({
		    name: 'epadilla@biinapp.com',
		    password: 'abc1236',
		    displayName:'Esteban Padilla',
		    accountIdentifier:'1002',
		    emails:['epadilla@biinapp.com']
		});
	*/

		var admin = new client({
		    name: 'cdominguez@biinapp.com',
		    password: 'abc1236',
		    displayName:'Carlos Dominguez',
		    accountIdentifier:'1004',
		    emails:['cdominguez@biinapp.com']
		});	
		// save a client to the database
		admin.save(function(err) {
			console.log(err);
			console.log('saved');
		});

		var admin1 = new client({
		    name: 'carce@biinapp.com',
		    password: 'abc1236',
		    displayName:'Cesar Arce',
		    accountIdentifier:'1005',
		    emails:['cdominguez@biinapp.com']
		});	
		// save a client to the database
		admin1.save(function(err) {
			console.log(err);
			console.log('saved');
		});

		var admin2 = new client({
		    name: 'lbonilla@biinapp.com',
		    password: 'abc1236',
		    displayName:'Luis Bonilla',
		    accountIdentifier:'1006',
		    emails:['lbonilla@biinapp.com']
		});	
		// save a client to the database
		admin2.save(function(err) {
			console.log(err);
			console.log('saved');
		});
		res.render('client/create',req.client);	
	}

	//Logout the client
	functions.logout = function(req,res){
		req.session.destroy();
		req.logout();
		res.redirect('/');
	}
	return functions;
}

