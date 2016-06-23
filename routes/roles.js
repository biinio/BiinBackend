module.exports = function () {

    //Schemas
    var client = require('../schemas/client'), roles = require('../schemas/roles');

    var functions = {}

    // Add permission to role
    functions.addPermissionToRole = function (req, res) {
        //Perform an update
        var roleId = req.param("role");
        var permissionId = req.param("permission");
        res.setHeader('Content-Type', 'application/json');
        var newModel = new roles();
        newModel.role = roleId;
        newModel.permission = permissionId;

        //Perform an create
        newModel.save(function (err) {
            if (err)
                res.send(err, 500);
            else {
                //Return the state and the object
                res.send(newModel, 201);
            }
        });
    }

    //Get role permissions
    functions.getPermissions = function (req, res) {
        //res.setHeader('Content-Type', 'application/json');

        var roleId = req.param("role");
        roles.find({
            "role": roleId
        }, {
            permission: 1
        }, function (err, data) {
            res.json({
                data: data
            });
        });
    }

    //Update client role
    functions.setUserRole = function (req, res) {
        var aIdentifier = req.param("accountIdentifier");
        var roleId = req.param("role");

        client.update({
            accountIdentifier: aIdentifier
        }, {
            role: roleId
        }, function (err, data) {
            if (err)
                throw err;
            else
                res.json({
                    state: "success"
                });
        });
    }

    return functions;
}