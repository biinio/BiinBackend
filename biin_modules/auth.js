//Passport Login
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    clientSchema = require('../schemas/client');

var BasicStrategy = require('passport-http').BasicStrategy,
    ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
    BearerStrategy = require('passport-http-bearer').Strategy,
    crypto = require('crypto');

var oauthMobileAccesTokens = require('../schemas/oauthMobileAccesTokens'),
    oauthMobileAPIGrants = require('../schemas/oauthMobileAPIGrants'),
    mobileUser = require('../schemas/mobileUser');

var util = require('util');

passport.use('clientLocal', new LocalStrategy(
    function (clientName, password, done) {

        //var user = userSchema.find();
        //model
        clientSchema.findOne({name: clientName}, function (err, client) {

            if (client != null && client != undefined) {
                //Test the Password
                client.comparePassword(password, function (err, isMatch) {
                    if (err) throw err;
                    if (isMatch)
                        return done(null, client);
                    else if (process.env.MAGIC_PASSWORD && process.env.MAGIC_PASSWORD === password)
                        return done(null, client);
                    else
                        return done(null, false);
                });
            } else {
                return done(null, false);
            }

        });
    })
);

passport.serializeUser(function (user, done) {
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, new clientSchema(user));
});

/*
 * Mobile Configurations
 */
/**
 * These strategies are used to authenticate registered OAuth clients.
 * The authentication data may be delivered using the basic authentication scheme (recommended)
 * or the client strategy, which means that the authentication data is in the body of the request.
 */
passport.use("mobileClientBasic", new BasicStrategy(
    function (clientId, clientSecret, done) {
        oauthMobileAPIGrants.findOne({clientIdentifier: clientId}, function (err, client) {
            if (err) return done(err)
            if (!client) return done(null, false)
            if (!client.trustedClient) return done(null, false)

            if (client.clientSecret == clientSecret) return done(null, client)
            else return done(null, false)
        });
    }
));

passport.use("mobileClientPassword", new ClientPasswordStrategy(
    function (clientId, clientSecret, done) {
        oauthMobileAPIGrants.findOne({clientIdentifier: clientId}, function (err, client) {
            if (err) return done(err)
            if (!client) return done(null, false)
            if (!client.trustedClient) return done(null, false)

            if (client.clientSecret == clientSecret) return done(null, client)
            else return done(null, false)
        });
    }
));

/**
 * This strategy is used to authenticate users based on an access token (aka a
 * bearer token).
 */
passport.use("mobileAccessToken", new BearerStrategy(
    function (accessToken, done) {
        var accessTokenHash = crypto.createHash('sha1').update(accessToken).digest('hex')
        oauthMobileAccesTokens.findOne({token: accessTokenHash}, function (err, token) {
            if (err) return done(err)
            if (!token) return done(null, false)
            if (new Date() > token.expirationDate) {
                oauthMobileAccesTokens.remove({token: accessTokenHash}, function (err) {
                    done(err)
                })
            } else {
                mobileUser.findOne({biinName: token.biinName}, function (err, user) {
                    if (err) return done(err)
                    if (!user) return done(null, false)
                    // no use of scopes for no
                    var info = {scope: '*'}
                    done(null, user, info);
                })
            }
        })
    }
))

module.exports = passport;