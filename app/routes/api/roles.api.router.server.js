'use strict';



/**
 * Module dependencies.
 */

module.exports = function (app) {

    var api = require('../../controllers/api.server.controller');

    //Roles routes
    // Add permission to role
    app.route('/roles/:role/:permission/addpermission').post( api.addPermissionToRole);
    app.route('/roles/:accountIdentifier/:role/setrole').put( api.setUserRole);
    app.route('/roles/:role/getpermission').get( api.getPermissions);
    app.route('/roles').get( api.getRoles);
    app.route('/roles').put( api.saveRoles);

    app.route('/roles/:role/:idpermission/deletepermission').delete(api.deletePermissionToRole);


};