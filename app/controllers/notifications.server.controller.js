var request = require('request');
var biiniesDevice = require('../models/biiniesDevice');

var server = "AIzaSyCY7GA6BIHzBJSRcup7is6csQHuEcARMb0";
var serverURL = "https://fcm.googleapis.com/fcm/send";

exports.sendNotificationToUser = function (message, title, to, sound, badge, data) {
    function callback(error, incomingMessage, body) {
        if (error) {
            throw  error;
        } else {
            console.log(body);
            console.log(incomingMessage);
        }
    }

    var dataToSend;
    if (data) {
        dataToSend = data;
    } else {
        dataToSend = {};
    }
    var baseRequest = request.defaults({
        'url': serverURL,
        'headers': {
            'Authorization': 'key=' + server,
            'Content-Type': 'application/json'
        },
        'json': {
            "priority": "high",
            "notification": {
                "title": title,
                "text": message,
                "sound": sound,
                "badge": badge
            },
            data: dataToSend,
            "to": to
        },
        'callback': callback
    });

    baseRequest.post();
};

/**
 *
 * @param to
 * @param title
 * @param message
 * @param sound
 * @param badge
 * @param data
 * @returns {Promise}
 */
exports.sendToUser = function (to, title, message, sound, badge, data) {
    sound = sound ? sound : "notification.wav";
    badge = badge ? badge : "1";
    title = title ? title : "Biin";
    message = message ? message : "Tienes un mensaje nuevo.";

    return new Promise(function (resolve, reject) {
        function callback(error, incomingMessage, body) {
            if (error) {
                reject(error)
            } else {
                console.log(body);
                console.log(incomingMessage);
                resolve();
            }
        }

        var dataToSend;
        if (data) {
            dataToSend = data;
        } else {
            dataToSend = {};
        }

        biiniesDevice.findOne({biinieIdentifier: to}, {}, function (err, biinieDevice) {
            if (err) {
                reject(err);
            }
            else {
                if (biinieDevice) {
                    var baseRequest = request.defaults({
                        'url': serverURL,
                        'headers': {
                            'Authorization': 'key=' + server,
                            'Content-Type': 'application/json'
                        },
                        'json': {
                            "priority": "high",
                            "notification": {
                                "title": title,
                                "text": message,
                                "sound": sound,
                                "badge": badge
                            },
                            data: dataToSend,
                            "to": biinieDevice.deviceIdentifier
                        },
                        'callback': callback
                    });
                    baseRequest.post();
                } else {
                    reject("Biinie doesn't exist");
                }
            }
        });
    });

};


exports.sendToEverybody = function (message, title, sound, badge, data) {
    function callback(error, incomingMessage, body) {
        if (error) {
            throw  error;
        } else {
            console.log(body);
            console.log(incomingMessage);
        }
    }

    var dataToSend;
    if (data) {
        dataToSend = data;
    } else {
        dataToSend = {};
    }

    var baseRequest = request.defaults({
        'url': serverURL,
        'headers': {
            'Authorization': 'key=' + server,
            'Content-Type': 'application/json'
        },
        'json': {
            "priority": "high",
            "notification": {
                "title": title,
                "text": message,
                "sound": sound,
                "badge": badge
            },
            data: dataToSend,
            "to": to
        },
        'callback': callback
    });

    baseRequest.post();
};