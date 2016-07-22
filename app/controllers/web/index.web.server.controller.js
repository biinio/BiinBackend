var fs = require('fs');
var organization = require('../../models/organization'),
    biin = require('../../models/biin');
var client = require('../../models/client');
var utils = require('../utils.server.controller');
var notification = require('../notifications.server.controller');

//Get the index page
exports.index = function (req, res) {
    res.render('index', {title: 'Biin', enviroment: process.env.NODE_ENV});
};
//Get the Login
exports.login = function (req, res) {
    res.render("login");
};

exports.terms = function (req, res) {
    res.render("termsAndConditions");
};

//Send emails
exports.sendEmail = function (req, res) {
    var transporter = require('nodemailer').createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ACCOUNT,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    var subject = "";
    var htmlBody = "";

    switch (req.query.typeEmail) {
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
            subject = "Pre Order Beacons of " + req.query.name;
            htmlBody = "<h3>" + subject + "</h3>" +
                "<b>Nombre</b>: <pre style='font-size: 14px'>" + req.query.name + "</pre>" +
                "<b>Email</b>: <pre style='font-size: 14px'>" + req.query.email + "</pre>" +
                "<b>Titulo</b>: <pre style='font-size: 14px'>" + req.query.title + "</pre>" +
                "<b>Mensaje</b>: <pre style='font-size: 14px'>" + req.query.comments + "</pre>";
            break;
        case "PreRegistrarBiin":
            subject = "Pre Registrar Biin " + req.query.name;
            htmlBody = "<h3>" + subject + "</h3>" +
                "<b>Nombre</b>: <pre style='font-size: 14px'>" + req.query.name + "</pre>" +
                "<b>Email</b>: <pre style='font-size: 14px'>" + req.query.email + "</pre>" +
                "<b>Titulo</b>: <pre style='font-size: 14px'>" + req.query.title + "</pre>" +
                "<b>Mensaje</b>: <pre style='font-size: 14px'>" + req.query.comments + "</pre>";
            break;

    }

    var indexName = req.query.name.indexOf(" ");
    var name = req.query.name;
    if (indexName > 0)
        var name = req.query.name.substring(0, indexName);
    //Load the template
    fs.readFile(__dirname + '/../public/landingPage/templates/emailTemplate_table.html', function (err, backEmailtemplate) {
        if (err) throw err;
        var processedEmail = " " + backEmailtemplate;
        processedEmail = processedEmail.replace('[[name]]', name);
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
        var backMailServer = {
            // sender address
            from: "Biin Message <" + process.env.EMAIL_ACCOUNT + ">",

            // list of receivers
            to: req.query.email,

            // Subject line
            subject: "Biin Contact",

            // plaintext body
            text: "",

            // html body
            html: processedEmail
        }

        // send mail with defined transport object
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                res.end(error.response);
            } else {
                //Send the e-mail back
                transporter.sendMail(backMailServer, function (error, info) {
                    if (error) {
                        console.log(error);
                        res.end(error.response);
                    } else {
                        console.log('Message sent: ' + info.response);
                        res.end(info.response.toString());
                    }

                })
            }
        });
    });

};

exports.testNotification = function (req, res) {
    var to = req.body.to;
    var message = req.body.message || "Mensaje";
    var title = req.body.title || "Biin";
    var sound = req.body.sound || "";
    var badge = req.body.badge || "";
    var data = req.body.data;
    notification.sendNotificationToUser(message, title, to, sound, badge, data);
    res.json({});
};