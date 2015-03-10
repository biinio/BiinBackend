module.exports = function () {
	var functions = {};
	var fs = require('fs');
	var organization= require('../schemas/organization');
	var client = require('../schemas/client');
	var utils = require('../biin_modules/utils')();
	//Get the index page
	functions.index = function(req, res){
	  res.render('index', { title: 'Biin' });	  
	};

	//Get the Login
	functions.login = function (req,res) {

		//The none ajax request is not available
		var is_ajax_request = true;// req.xhr;
		if(!is_ajax_request){
			res.render('login',{title:'login'});
		}
		else{
			var obj={
				status:"error",
				url: '/login'
			}
			res.json(obj);			
		}

	};

	//Get the Dashboard
	functions.home = function(req,res){
		//var organization={};
		if(typeof(req.session.defaultOrganization)==='undefined'){
			if(typeof(req.user.defaultOrganization)!=='undefined' && req.user.defaultOrganization!=='')
				organization.findOne({"accountIdentifier":req.user.accountIdentifier,"identifier":req.user.defaultOrganization},{name:true, identifier:true},function (err, data) {
					//set the first time for the data
					req.session.defaultOrganization = data;					
					res.render('homeDashboard',{title:'Welcome!',user:req.user,organization:data});						
				});
			else{
				req.user.defaultOrganization = null;
				res.render('homeDashboard',{title:'Welcome!',user:req.user, organization:req.user.defaultOrganization});	
			}
		}				
		else
			res.render('homeDashboard',{title:'Welcome!',user:req.user,organization:req.session.defaultOrganization});	
	}

	//Get the SingUp information of a client
	functions.singup =function(req,res){	
		res.render('singup/index',{title:'Signup!',user:req.user});
	}
    	

	//Get the dashboard
	functions.dashboard = function (req,res) {
		//The none ajax request is not available
		var is_ajax_request = true;// req.xhr;
		if(!is_ajax_request){
			if(req.session.passport.user==undefined){
				res.redirect('/login');
			}else{
				 res.render('homeDashboard',{title:'Welcome!',				
				 user:req.user});
			}
		}else{
			var obj={
				status:"error"
			}

			if(req.session.passport.user==undefined){
				obj.url= '/login';
			}else{
				obj.url ="/home";
				obj.status="success"
			}

			res.json(obj);			
		}
	};

	//Get the partial views for use with angular
	functions.partials = function(req, res){
	  var filename = req.params.filename;
	  if(!filename) return;  // might want to change this
	  res.render("_partials/" + filename );
	}

	//Get the pre-register form
	functions.preregister =function(req,res){
		res.render("index_pre_register",{packageSlected:req.params.packageSlected,accept:req.params.accept});
	}

	//Get the pre-order form
	functions.preorder =function(req,res){
		res.render("index_pre_order",{packageSlected:req.params.packageSlected,accept:req.params.accept});
	}

	//Get the pre-order form
	functions.terms=function(req,res){

		var backPage = req.params.backPage.replace('-','/');
		res.render("termsAndConditions",{backPage:backPage});
	}
	
	//Send emails
	functions.sendEmail = function(req,res){
		var transporter = require('nodemailer').createTransport({
	        service: 'gmail',
	        auth: {
	            user: process.env.EMAIL_ACCOUNT,
	            pass: process.env.EMAIL_PASSWORD
	        }
	    });

        var subject = "";
        var htmlBody = "";

        switch(req.query.typeEmail){
            case "NewsLetter":
                subject = "Nuevo email subscrito en Biin!";
                htmlBody = "<h3>" + subject + "</h3>" +
                    "<b>Email</b>: <pre style='font-size: 14px'>" + req.query.subsEmail + "</pre>";
                break;

            case "Contact":
                subject = "Nuevo email para contactarse con Biin!";
                htmlBody = "<h3>" + subject + "</h3>" +
                    "<b>Nombre</b>: <pre style='font-size: 14px'>" + req.query.name + "</pre>" +
                    "<b>Email</b>: <pre style='font-size: 14px'>" + req.query.email + "</pre>" +
                    "<b>Titulo</b>: <pre style='font-size: 14px'>" + req.query.title + "</pre>" +
                    "<b>Mensaje</b>: <pre style='font-size: 14px'>" + req.query.comments + "</pre>";
                break;
            case "PreOrderBeacons":
                subject = "Pre Order Beacons of "+req.query.name;
                htmlBody = "<h3>" + subject + "</h3>" +
                    "<b>Nombre</b>: <pre style='font-size: 14px'>" + req.query.name + "</pre>" +
                    "<b>Email</b>: <pre style='font-size: 14px'>" + req.query.email + "</pre>" +
                    "<b>Titulo</b>: <pre style='font-size: 14px'>" + req.query.title + "</pre>" +
                    "<b>Mensaje</b>: <pre style='font-size: 14px'>" + req.query.comments + "</pre>";
                break;
            case "PreRegistrarBiin":
                subject = "Pre Registrar Biin "+req.query.name;
                htmlBody = "<h3>" + subject + "</h3>" +
                    "<b>Nombre</b>: <pre style='font-size: 14px'>" + req.query.name + "</pre>" +
                    "<b>Email</b>: <pre style='font-size: 14px'>" + req.query.email + "</pre>" +
                    "<b>Titulo</b>: <pre style='font-size: 14px'>" + req.query.title + "</pre>" +
                    "<b>Mensaje</b>: <pre style='font-size: 14px'>" + req.query.comments + "</pre>";
                break;  

        }

        var indexName=req.query.name.indexOf(" ");
        var name= req.query.name;
        if(indexName>0)
        	var name= req.query.name.substring(0,indexName);
        //Load the template
        fs.readFile(__dirname +'/../public/landingPage/templates/emailTemplate_table.html', function (err, backEmailtemplate) {
		  if (err) throw err;
		  var processedEmail = " " +backEmailtemplate;
		  processedEmail= processedEmail.replace('[[name]]',name);
			// setup e-mail data with unicode symbols
			var mailOptions = {
				// sender address
			    from: "Biin Message <" + process.env.EMAIL_ACCOUNT + ">",

			    // list of receivers
			    to: process.env.EMAIL_TO,

			    // Subject line
			    subject: subject,

			    // plaintext body
			    text: "",

			    // html body
			    html: htmlBody
			};
			var backMailServer={
				// sender address
			    from: "Biin Message <" + process.env.EMAIL_ACCOUNT + ">",

			    // list of receivers
			    to: req.query.email ,

			    // Subject line
			    subject: "Biin Contact",

			    // plaintext body
			    text: "",

			    // html body
			    html: processedEmail
			}

			// send mail with defined transport object
			transporter.sendMail(mailOptions, function(error, info){
			    if(error){
			        console.log(error);
			        res.end(error.response);
			    }else{
			    	//Send the e-mail back
			    	transporter.sendMail(backMailServer,function(error,info){
			    		if(error){
			    			console.log(error);
			    			res.end(error.response);
			    		}else{
							console.log('Message sent: ' + info.response);
							res.end(info.response.toString());            			
			    		}

			    	})               
			    }
			});		  
		});        

    }

    //Get the mobile Test page
    functions.mobileTest =function(req,res){    	
    	res.render('mobileTest', { title: 'Biin' });	
    }

    
    
	return functions;
};