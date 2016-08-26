//Send an e-mail verification
exports.sendVerificationMail = function (req, model, callback) {

    var url = req.protocol + '://' + req.get('host') + "/client/" + model.accountIdentifier + "/activate";
    var subject = "Welcome to Biin";
    var htmlBody = "<h3>" + subject + "</h3>" +
        "<b>Hi</b>: <pre style='font-size: 14px'>" + model.displayName + "</pre>" +
        "<b>Thanks for join Biin</b>" +
        "<b>Your user is </b>: <pre style='font-size: 14px'>" + model.name + "</pre>" +
        "<b>In order to complete your registration please visit the following link</b><a href='" + url + "'> BIIN USER ACTIVATION </a>";

    sendEmail("[ BIIN NO REPLY] <" + process.env.EMAIL_ACCOUNT + ">",model.emails[0],subject,htmlBody,callback )
};

//Send an e-mail invitation
exports.sendInvitationMail = function (req, model, password, callback) {

    var url = req.protocol + '://' + req.get('host') + "/client/" + model.accountIdentifier + "/activate";
    var subject = "Welcome to Biin";
    var htmlBody = "<h3>" + subject + "</h3>" +
        "<b>Hi</b>: <pre style='font-size: 14px'>" + model.displayName + "</pre>" +
        "<b>Thanks for join Biin</b>" +
        "<b>Your user is </b>: <pre style='font-size: 14px'>" + model.name + "</pre>" +
        "<b>Your password is </b>: <pre style='font-size: 14px'>" + password + "</pre>" +
        "<b>In order to complete your registration please visit the following link </b>" +
        "<a href='" + url + "'> BIIN USER ACTIVATION </a>";

    sendEmail("[ BIIN NO REPLY] <" + process.env.EMAIL_ACCOUNT + ">",model.emails[0],subject,htmlBody,callback )
};

function sendEmail(from,to,subject,html, callback){
    var transporter = require('nodemailer').createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ACCOUNT,
            pass: process.env.EMAIL_PASSWORD
        }
    });
// setup e-mail data with unicode symbols
    var mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: "",
        html: html
    };
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function (error, info) {
        console.log(error);
        callback();
    });
}