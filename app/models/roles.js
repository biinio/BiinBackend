var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var roleSchema = new Schema({
    role: {type: String, default: ""},
    permission: {type: String, default: ""}
});

module.exports = mongoose.model('roles', roleSchema);

