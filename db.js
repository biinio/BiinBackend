var mongoose = require('mongoose');

mongoose.connect('mongodb://lbonilla:ludusydb1@ds037358.mongolab.com:37358/biin');
module.exports = mongoose.connection;