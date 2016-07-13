'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
    require('./mobile/endpoint.mobile.server.controller'),
    require('./mobile/oauth.mobile.server.controller'),
    require('./mobile/routes.mobile.server.controller'),
    require('./mobile/biinieobjects.mobile.server.controller'),
    require('./mobile/elements.mobile.server.controller'),
    require('./mobile/gifts.mobile.server.controller'),
    require('./mobile/rating.mobile.server.controller'),
    require('./mobile/user.mobile.server.controller'),
    require('./mobile/showcases.mobile.server.controller')
);
