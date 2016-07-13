var sysGlobals = require('../../models/sysGlobals');

//Set Fiil the standards enviroments variables
exports.setGlobals = function (req, res) {
    var enviroments = [{
        identifier: 'AABBCCDD-A101-B202-C303-AABBCCDDEEFF',
        mayorCounter: 0,
        description: 'Indoors Enviroment'
    }];
    sysGlobals.create(enviroments, function (err) {
        if (err)
            throw err;
        else
            res.json({status: 0});
    })
};

//Get a enviroment by identifier
exports.getEnviroment = function (identifier, callback) {
    sysGlobals.findOne({'identifier': identifier}, function (err, data) {
        callback(data)
    });
};

//Get and Update the Major of a Sys Global
exports.incrementMajor = function (identifier, callback) {
    sysGlobals.findOne({'identifier': identifier}, function (err, enviroment) {
        enviroment.majorCount++;
        enviroment.save(function (err) {
            callback(enviroment.majorCount)
        })
    });
};
