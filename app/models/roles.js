var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var roleSchema = new Schema({
    role: {type: String, default: ""},
    permission: {type: String, default: ""},
    isSysAdminPermission : {type:Boolean, default: false}
});

module.exports = mongoose.model('roles', roleSchema);

