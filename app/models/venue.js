var moongose = require('mongoose');

module.exports = moongose.model('venue', {
    identifier: {type: String, index: true, default: ""},
    name: {type: String, index: true, default: ""},
    organizationIdentifier: {type: String, default: ""}
});

