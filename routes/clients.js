module.exports = function(){

    //Schemas
	var client = require('../schemas/client'), organization = require('../schemas/organization'), role = require('../schemas/roles');
	var utils = require('../biin_modules/utils')();
	var functions ={}

	//Get Client List
	functions.index = function(req,res){
		res.render('client/index',req.user);		
	}

	//Get Client Creates
	functions.createView = function(req,res){
		res.render('client/create',req.client);
	}
	
	functions.set =function(req,res){
	 	var model = req.body.model;	 	
	 	var company = req.body.model.company;

		client.findOne({name:model.name},function(err,foundClient){
			if(foundClient){
				res.send(500,'The Account Name is already taken');
			}else{

				var organizationIdentifier = utils.getGUID();

				var accountIdentifier= utils.getGUID();
				var newModel = new client({
						accountIdentifier: accountIdentifier,
						name:model.name,
						password:model.password,
                        accountState:false,
                        defaultOrganization:organizationIdentifier,
                        emails:[model.name]
					});

					//Save The Model
					newModel.save(function(err){
						if(err)
							throw err;
						else{
							//Create the default Organization and then send the e-mail verification
							createDefaultOrganization(accountIdentifier,organizationIdentifier, company,function(organization){
								//Sent the e-mail verification
								sendVerificationMail(req,newModel,function(err){
									if(err)
										res.send(500);
									else	
										//login with the client								
										req.logIn(newModel,function(err){
											if(err)
												res.json({status:1})
											else{
												req.session.defaultOrganization = organization;
												//Return the state and the object
												res.json({status:0,redirect:"/home"});
											}
										})						
								});								
							})						
						}
					});
			}
		});
	}

	//Send an e-mail verification
	function sendVerificationMail(req,model,callback){

		var transporter = require('nodemailer').createTransport({
	        service: 'gmail',
	        auth: {
	            user: process.env.EMAIL_ACCOUNT,
	            pass: process.env.EMAIL_PASSWORD
	        }
	    });

		var url= req.protocol + '://' + req.get('host')+"/client/"+model.accountIdentifier+"/activate";
		var subject ="Welcome to Biin";
		var htmlBody = "<h3>"+subject+"</h3>" +
                    "<b>Hi</b>: <pre style='font-size: 14px'>" + model.displayName + "</pre>" +                    
                    "<b>Thanks for join Biin</b>" +
                    "<b>Your user is </b>: <pre style='font-size: 14px'>" + model.name + "</pre>" +
                    "<b>In order to complete your registration please visit the following link</b><a href='"+url+"'> BIIN USER ACTIVATION </a>";

        // setup e-mail data with unicode symbols
		var mailOptions = {
			// sender address
		    from: "[ BIIN NO REPLY] <" + process.env.EMAIL_ACCOUNT + ">",

		    // list of receivers
		    to: model.emails[0],

		    // Subject line
		    subject: subject,

		    // plaintext body
		    text: "",

		    // html body
		    html: htmlBody
		};
		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
		    callback();
		});		
	}

	//GET verify a e-mail availability
	functions.verifyEmailAvailability=function (req,res){
		var value =req.body.value;
		if(value){
			client.findOne({name:value},function(err,model){
				if(err)
					res.json({result:false});
				res.json({result:typeof(model)==='undefined'|| model===null})
			});
		}else{
			res.json({result:false});
		}

	}

	//Set the activation of an user
	functions.activate= function(req,res){

		var userAccount=req.param("identifier");
		client.findOne({accountIdentifier:userAccount, accountState:false},function(err, foundClient){
			if(err)
				res.send(500,"The user was not found")
			else{
				if( typeof(foundClient)==='undefined'|| foundClient==null)
					res.send(500,"The user was not found")
				foundClient.accountState=true;
				foundClient.save(function(err){
					if(err)
						res.send(err, 500);
					else{
						req.logIn(foundClient,function(err){
							if(err)
								res.send(500)
							else
								//Return the state and the object
								res.redirect("/home");
						})						
					}
				});		
			}
		})

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

	//Other Functions 
	function createDefaultOrganization(accountIdentifier, organizationIdentifier, companyName , callback){
	    var newModel = new organization();	    

		//Set the account and de user identifier
	    newModel.identifier=organizationIdentifier
		newModel.accountIdentifier= accountIdentifier;
		newModel.name=companyName;

		//Perform an create
		newModel.save(function(err){
			if(err)
				res.send(err, 500);
			else{
				//Return the state and the object
				callback(newModel)
			}
		});			
	}
	return functions;
}

