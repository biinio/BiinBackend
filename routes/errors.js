module.exports = function (db) {
    var error = require('../schemas/error');
    var functions = {}

    //Get Erros List
    functions.index = function (req, res) {
        error.find({}, '', function (err, data) {
            res.render('utils/error', {title: 'Errors', user: req.user, errors: data});

        })
    }

    //Post a new Error
    functions.create = function (req, res) {
        if (req.body) {
            // create a new error
            var newError = new error({
                code: req.body.code,
                title: req.body.title,
                description: req.body.description,
                proximityUUID: req.body.proximityUUID,
                region: req.body.region
            });

            // save error to database
            newError.save(function (err) {
                if (err)
                    res.json({"status": "error"});
                else
                    res.json({"status": "success"});
            });
        }
        else {
            res.json({"status": "error"});
        }
    }

    return functions;
}

