module.exports = function () {
    var functions = {};
    var sticker = require('../schemas/sticker');


    //Set categories in database
    functions.set = function (req, res) {
        var stickers = [
            {identifier: "stick01", title1: "free gift", color: "#ed1c24"},
            {identifier: "stick02", title1: "best", title2: "offer", color: "#38b449"}
        ];

        //Insert of castegories
        sticker.create(stickers, function (err) {
            if (err)
                throw err;
            else {

                console.log("Success");
                res.send("Succesd", 200);
            }
        });
    }

    //GET the lis of sticker
    functions.get = function (req, res) {
        sticker.find({}, function (err, data) {
            res.json({data: data});
        });
    }

    return functions;

}