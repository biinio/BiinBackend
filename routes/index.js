module.exports = function () {
	var functions = {};

	//Get the index page
	functions.index = function(req, res){
	  res.render('index', { title: 'Biin' });
	  //res.sendfile('views/index.html');
	};

	//Get the Login
	functions.login = function (req,res) {
		var is_ajax_request = req.xhr;
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
		res.render('homeDashboard',{title:'Welcome!',user:req.user});	
	}

	//Get the dashboard
	functions.dashboard = function (req,res) {
		var is_ajax_request = req.xhr;
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

	functions.preregister =function(req,res){
		res.render("index_pre_register",{packageSlected:req.params.packageSlected});
	}

	functions.preorder =function(req,res){
		res.render("index_pre_order",{packageSlected:req.params.packageSlected});
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

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                console.log(error);
                res.end(error.response);
            }else{
                console.log('Message sent: ' + info.response);
                res.end(info.response.toString());
            }
        });
    }
	return functions;
};