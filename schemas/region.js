var mongoose = require('mongoose');

module.exports = mongoose.model('regions', {
    identifier: String,
    radious: String,
    latitude: String,
    longitude: String,
    sites: [{
        identifier: {type: String, index: true},
        categories: [
            {
                identifier: {type: String, index: true, default: "-1"},
                name: {type: String, default: ""},
                displayName: {type: String, default: ""},
                url: {type: String, default: ""}
            }
        ]
    }],
    sitesCount: String
});