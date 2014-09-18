var oauth2orize = require('oauth2orize')
    , passport = require('passport')
    , crypto = require('crypto')
    , utils = require("./utils")()
    , bcrypt = require('bcrypt')
    , oauthMobileAccessTokens = require('../schemas/oauthMobileAccesTokens')
    , oauthMobileRefreshTokens = require('../schemas/oauthMobileRefreshTokens')
    , mobileUser = require('../schemas/mobileUser')
    , util = require('util');

// create OAuth 2.0 server
var server = oauth2orize.createServer();

//Resource owner password
server.exchange(oauth2orize.exchange.password(function (client, biinName, password, scope, done) {
    mobileUser.findOne({biinName:biinName}, function (err, mobUser) {
        if (err) return done(err)
        if (!mobUser) return done(null, false)
        bcrypt.compare(password, mobUser.password, function (err, res) {
            if (!res) return done(null, false)
            
            var token = utils.getUIDByLen(256)
            var refreshToken = utils.getUIDByLen(256)

            console.log("The new token is: " + token);
            var tokenHash = crypto.createHash('sha1').update(token).digest('hex')
            var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')
            
            console.log("The hash token is: " + tokenHash);

            var expirationDate = new Date(new Date().getTime() + (3600 * 1000))
            var newTokenModel = new oauthMobileAccessTokens({token: tokenHash, expirationDate: expirationDate, clientId: client.clientId, biinName: biinName, scope: scope});
            newTokenModel.save(function (err) {
                if (err) return done(err)
                var newrefreshTokenModel = new oauthMobileRefreshTokens({refreshToken: refreshTokenHash, clientId: client.clientId, biinName: biinName});
                newrefreshTokenModel.save(function (err) {
                    if (err) return done(err)
                    done(null, token, refreshToken, {expires_in: expirationDate})
                });
            });
        });
    });
}))

//Refresh Token
server.exchange(oauth2orize.exchange.refreshToken(function (client, refreshToken, scope, done) {
    console.log("Refresh token");
    var refreshTokenHash = crypto.createHash('sha1').update(refreshToken).digest('hex')

    oauthMobileRefreshTokens.findOne({refreshToken: refreshTokenHash}, function (err, token) {
        if (err) return done(err)
        if (!token) return done(null, false)
        console.log("The client: " + utils.inspect(client,{depth:null}));
        if (client.clientId !== token.clientId) return done(null, false)
        
        var newAccessToken = utils.getUIDByLen(256)
        var accessTokenHash = crypto.createHash('sha1').update(newAccessToken).digest('hex')
        
        var expirationDate = new Date(new Date().getTime() + (3600 * 1000))
    
        oauthMobileAccessTokens.update({userId: token.userId}, {$set: {token: accessTokenHash, scope: scope, expirationDate: expirationDate}}, function (err) {
            if (err) return done(err)
            done(null, newAccessToken, refreshToken, {expires_in: expirationDate});
        })
    })
}))

// token endpoint
exports.token = [
    passport.authenticate(['mobileClientBasic', 'mobileClientPassword'], { session: false }),
    server.token(),
    server.errorHandler()
]
