module.exports = function(app,db, passport){
    //Others routes
    var users = require('./routes/users')(db);
    var organizations = require('./routes/organizations')(db);
    var showcases = require('./routes/showcases')(db);
    var regions = require('./routes/regions')(db);
    var biins = require('./routes/biins')(db);
    var errors = require('./routes/errors')(db);


}