module.exports = function () {
	var functions = {};
	
	functions.index = function(req, res){
	  res.render('index', { title: 'Express' });
	};

	functions.login = function (req,res) {
		res.render('login',{title:'login'});
	};

	functions.dashboard = function (req,res) {
		if(req.session.passport.user==undefined){
			res.redirect('/login');
		}else{
			res.render('homeDashboard',{title:'Welcome!',				
			 user:req.user});
		}
	};

	return functions;
};