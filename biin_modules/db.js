var mongoose = require('mongoose');
var connectionString =process.env.DB_CONNECTION;
mongoose.connect(connectionString);
module.exports = mongoose.connection;