module.exports = function () {
	var functions = {};
	
	//Get the index page
	functions.index = function(req, res){
	  //res.render('index', { title: 'Express' });
	  res.sendfile('views/index.html');
	};

	//Get the Login
	functions.login = function (req,res) {
		var is_ajax_request = req.xhr;
		if(!is_ajax_request){
			res.render('login',{title:'login'});
		}
		else{
			var obj={
				status:"error",
				url: '/login'
			}
			res.json(obj);			
		}
	};

	//Get the Dashboard
	functions.home = function(req,res){
		res.render('homeDashboard',{title:'Welcome!',user:req.user});	
	}

	//Get the dashboard
	functions.dashboard = function (req,res) {
		var is_ajax_request = req.xhr;
		if(!is_ajax_request){
			if(req.session.passport.user==undefined){
				res.redirect('/login');
			}else{
				 res.render('homeDashboard',{title:'Welcome!',				
				 user:req.user});
			}
		}else{
			var obj={
				status:"error"
			}

			if(req.session.passport.user==undefined){
				obj.url= '/login';
			}else{
				obj.url ="/home";
				obj.status="success"
			}

			res.json(obj);			
		}
	};

	//Get the partial views for use with angular
	functions.partials = function(req, res){
	  var filename = req.params.filename;
	  if(!filename) return;  // might want to change this
	  console.log("_partials/" + filename);
	  res.render("_partials/" + filename );
	}
	
	return functions;
};