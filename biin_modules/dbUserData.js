var mongoose = require('mongoose'),  
    mongoURI = process.env.DB_CONNECTION_USER_DATA;

module.exports = dbUserData = mongoose.createConnection(mongoURI);

dbUserData.on('connected', function() {  
  console.log('Mongoose connected to user data base');
});