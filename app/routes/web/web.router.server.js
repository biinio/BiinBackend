'use strict';

/**
 * Module dependencies.
 */

module.exports = function (app) {
    // Organization Routes
    var web = require('../../controllers/web.server.controller');
    var passport = require('../../controllers/auth.server.controller');
    var api = require('../../controllers/api.server.controller');
    app.route('/accounts').get(web.accounts);

    app.route('/login').get(web.login);

    app.get('/sendEmail', web.sendEmail);

    app.post('/api/singup', api.setClient);
    app.get('/client/:identifier/activate', web.activateClient);
    app.post('/client/:identifier/activate', web.activateClient);


    app.post('/api/login', function (req, res, next) {
        passport.authenticate('clientLocal', function (err, user) {
            if (err) {
                return next(err);
            }
            // Redirect if it fails
            if (!user) {
                return res.json({status: "success", url: "/accounts"});
            }
            return res.json({status: "success", url: "/accounts"});
        })(req, res, next);
    });


    app.get('/downloads', function (req, res) {
        var path = require('path');
        res.sendFile(path.resolve('public/downloads.html'));
    });



    app.put('/test/notifications',web.testNotification);
};

