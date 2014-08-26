console.log("THE DB CONNECTION IS: "+ process.env.DB_CONNECTION);
var mongoose = require('mongoose');
mongoose.connect(process.env.DB_CONNECTION);
module.exports = mongoose.connection;