var biinBiinieObject = require('../../models/biinBiinieObject');

//Set if a user is biineed an object
exports.setBiined = function (req, res) {

    var objectIdentifier = req.param('objectIdentifier');
    var biinIdentifier = req.param('biinIdentifier');
    var biinieIdentifier = req.param('biinieIdentifier');
    biinBiinieObject.findOne({
        'objectIdentifier': objectIdentifier,
        'biinIdentifier': biinIdentifier,
        'biinieIdentifier': biinieIdentifier
    }, function (err, biinData) {
        if (err) {
            throw err;
        } else {
            var date = utils.getDateNow();
            if (biinData) {
                biinData.isBiined = '1';
                biinData.biinedTime = date;
                biinData.save(function (err, cantAffected) {
                    if (err)
                        throw err;
                    else {
                        res.json({status: "1", result: "0"});
                    }
                })
            } else {

                biinBiinieObject.create({
                    'objectIdentifier': objectIdentifier,
                    'biinIdentifier': biinIdentifier,
                    'biinieIdentifier': biinieIdentifier,
                    isBiined: '1',
                    biinedTime: date,
                    'isNotified': '0',
                    'notifiedTime': ''
                }, function (err, cantAffected) {
                    if (err)
                        throw err;
                    else {
                        res.json({status: "1", result: "0"});
                    }
                });
            }
        }
    });
}

//Set if a user is notified an object
exports.setNotified = function (req, res) {

    var objectIdentifier = req.param('objectIdentifier');
    var biinIdentifier = req.param('biinIdentifier');
    var biinieIdentifier = req.param('biinieIdentifier');

    biinBiinieObject.findOne({
        'objectIdentifier': objectIdentifier,
        'biinIdentifier': biinIdentifier,
        'biinieIdentifier': biinieIdentifier
    }, function (err, biinData) {
        if (err) {
            throw err;
        } else {
            var date = utils.getDateNow();
            if (biinData) {
                biinData.isNotified = '1';
                biinData.notifiedTime = date;
                biinData.save(function (err, cantAffected) {
                    if (err)
                        throw err;
                    else {
                        res.json({status: "1", result: "0", data: {}});
                    }
                })
            } else {

                biinBiinieObject.create({
                    'objectIdentifier': objectIdentifier,
                    'biinIdentifier': biinIdentifier,
                    'biinieIdentifier': biinieIdentifier,
                    isBiined: '0',
                    biinedTime: '',
                    'isNotified': '1',
                    'notifiedTime': date
                }, function (err, cantAffected) {
                    if (err)
                        throw err;
                    else {
                        res.json({status: "1", result: "0", data: {}});
                    }
                });

            }
        }
    });
}