module.exports = function(db){
	var error = require('../schemas/error');
	var functions ={}

	//Post a new Error
	functions.create = function(req,res){
		// create a new error
		var newError = new error({
		    	code:req.param("code"),
				title:req.param("title"),
				description:req.param("description"),
				proximityUUID:req.param("proximityUUID"),
				region:req.param("region")
		});

		// save error to database
		newError.save(function(err) {
			if(err)
				res.json({"status":"error"});
			else
				res.json({"status":"success"});
		});
	}

	return functions;
}

