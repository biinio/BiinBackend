module.exports = function () {

    var request = require('request');

    var functions = {};
    var server = "AIzaSyCY7GA6BIHzBJSRcup7is6csQHuEcARMb0";
    var serverURL = "https://fcm.googleapis.com/fcm/send";

    functions.sendNotificationToUser = function (message, title, to, sound, badge, data) {
        function callback(error, incomingMessage, body){
            if(error){
                throw  error;
            }else{
                console.log(body);
                console.log(incomingMessage);
            }
        }
        var dataToSend;
        if(data){
            dataToSend = data;
        }else {
            dataToSend = {};
        }
        var baseRequest = request.defaults({
            'url': serverURL,
            'headers': {
                'Authorization': 'key=' + server,
                'Content-Type': 'application/json'
            },
            'json': {
                "priority":"high",
                "notification": {
                    "title": title,
                    "text": message,
                    "sound": sound,
                    "badge": badge
                },
                data:dataToSend,
                "to": to
            },
            'callback':callback
        });

        baseRequest.post();
    };




    functions.sendToUser = function (message, title, to, sound, badge, data) {
        function callback(error, incomingMessage, body){
            if(error){
                throw  error;
            }else{
                console.log(body);
                console.log(incomingMessage);
            }
        }
        var dataToSend;
        if(data){
            dataToSend = data;
        }else {
            dataToSend = {};
        }
        var baseRequest = request.defaults({
            'url': serverURL,
            'headers': {
                'Authorization': 'key=' + server,
                'Content-Type': 'application/json'
            },
            'json': {
                "priority":"high",
                "notification": {
                    "title": title,
                    "text": message,
                    "sound": sound,
                    "badge": badge
                },
                data:dataToSend,
                "to": to
            },
            'callback':callback
        });

        baseRequest.post();
    };


    functions.sendToEverybody = function (message, title, to, sound, badge, data) {
        function callback(error, incomingMessage, body){
            if(error){
                throw  error;
            }else{
                console.log(body);
                console.log(incomingMessage);
            }
        }

        var dataToSend;
        if(data){
            dataToSend = data;
        }else {
            dataToSend = {};
        }

        var baseRequest = request.defaults({
            'url': serverURL,
            'headers': {
                'Authorization': 'key=' + server,
                'Content-Type': 'application/json'
            },
            'json': {
                "priority":"high",
                "notification": {
                    "title": title,
                    "text": message,
                    "sound": sound,
                    "badge": badge
                },
                data:dataToSend,
                "to": to
            },
            'callback':callback
        });

        baseRequest.post();
    };

    return functions;
};