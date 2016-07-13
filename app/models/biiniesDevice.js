/**
 * Created by Ivan on 7/1/16.
 */
var moongose = require('mongoose');

module.exports = moongose.model('biiniesDevice', {
    biinieIdentifier: {type: String, index: true, default: ""},
    deviceIdentifier: {type: String, index: true, default: ""},
    platform: {type: String, index: true, default: ""}
});
