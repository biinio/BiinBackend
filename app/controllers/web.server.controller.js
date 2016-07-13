'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
    require('./web/account.web.server.controller'),
    require('./web/index.web.server.controller'),
    require('./web/clients.web.server.controller')
);
