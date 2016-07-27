'use strict';

/**
 * Module dependencies.
 */
var _ = require('lodash');

/**
 * Extend user's controller
 */
module.exports = _.extend(
    require('./api/accounts.api.server.controller.js'),
    require('./api/categories.api.server.controller'),
    require('./api/biins.api.server.controller.js'),
    require('./api/biinies.api.server.controller'),
    require('./api/clients.api.server.controller.js'),
    require('./api/dashboard.api.server.controller.js'),
    require('./api/elements.api.server.controller.js'),
    require('./api/gallery.api.server.controller.js'),
    require('./api/gifts.api.server.controller.js'),
    require('./api/globals.api.server.controller.js'),
    require('./api/maintenance.api.server.controller.js'),
    require('./api/notices.api.server.controller.js'),
    require('./api/organizations.api.server.controller.js'),
    require('./api/rating.api.server.controller.js'),
    require('./api/roles.api.server.controller.js'),
    require('./api/showcases.api.server.controller.js'),
    require('./api/sites.api.server.controller.js'),
    require('./api/cards.api.server.controller.js')
);
