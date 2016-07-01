/**
 * Created by Ivan on 7/1/16.
 */
module.exports = function () {

    var request = require('request');

    var functions = {};
    var server = "AIzaSyCY7GA6BIHzBJSRcup7is6csQHuEcARMb0";
    var serverID = "323383814519";
    var serverURL = "https://fcm.googleapis.com/fcm/send";

    functions.sendNotificationToUser = function (message, title, to, sound, badge) {
        function callback(error, incomingMessage, body){
            if(error){
                throw  error;
            }else{
                console.log(body);
                //console.log(incomingMessage);
            }
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
                    "text": message
                },
                "to": to
            },
            'callback':callback
        });

        baseRequest.post();
    };

    return functions;
};