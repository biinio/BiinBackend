var mongoose = require('mongoose');
var connectionString =process.env.DB_CONNECTION;
console.log("The connection string is: " + connectionString);
mongoose.connect(connectionString);
module.exports = mongoose.connection;