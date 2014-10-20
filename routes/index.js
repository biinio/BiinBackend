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
        var backEmailtemplate='<p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">Hola '+name+'</span></span></p><p>&nbsp;</p><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">Gracias por su inter&eacute;s en Biin, usted ha elegido deleitar a sus visitantes con una experiencia digital con contexto e incrementar su presencia digital en beneficio de su negocio o instituci&oacute;n.</span></span></p><p>&nbsp;</p><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">En los pr&oacute;ximos d&iacute;as nos pondremos en contacto con usted para informarlo sobre detalles importantes de la plataforma, as&iacute; como para brindarle informaci&oacute;n que lo prepare para la implementaci&oacute;n de Biin en su empresa o instituci&oacute;n.</span></span></p><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">Tambi&eacute;n estaremos coordinando las instrucciones para el pago de la suscripci&oacute;n y los detalles de env&iacute;o de los Biin Beacons. </span></span></p><p>&nbsp;</p><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">En Biin estamos trabajando fuerte para completar los elementos de la plataforma y proveer un servicio de alta calidad.</span></span></p><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">Biin estar&aacute; disponible iniciando el 2015, lo mantendremos informado sobre el avance y le daremos informaci&oacute;n relevante que lo ayude a planificar la implementaci&oacute;n de su campa&ntilde;a con Biin. </span></span></p><p><br />&nbsp;</p><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">Saludos cordiales</span></span></p><p dir="ltr" style="line-height:1.15;margin-top:0pt;margin-bottom:0pt;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">C&eacute;sar Arce </span></span></p><p><span id="docs-internal-guid-ed5a30ee-25e1-2bd6-124b-ef48aea7619a"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;"><span id="docs-internal-guid-ed5a30ee-25e5-e09a-9578-19235364f0ea"><span style="font-size: 15px; font-family: Arial; color: rgb(0, 0, 0); vertical-align: baseline; white-space: pre-wrap; background-color: transparent;">CEO en Biin</span></span></span></span></p>';
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
            html: backEmailtemplate
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


    }
	return functions;
};