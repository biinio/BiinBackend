module.exports = function(){
  var functions={};

  //List of articles
  functions.list = function(req, res){
    var directory ='../public/blog';
    var walk = require('walk'), fs = require('fs'), options, walker;
    var walker = walk.walk('./public/blog', { followLinks: false });

    var fs = [];

    walker.on("file", function(root,file,next){
      var f =  root + "/" + file['name'].substring(0, file['name'].lastIndexOf('.'));

      // push without /blog prefix
      fs.push(f.substring(f.indexOf('/')));
      next();
    });

    walker.on("end", function() {
      res.render('blog/index', { title: 'Entries', user:req.user, blogs: fs });
    });
  };

  functions.entry = function(req, res){
    var md = require('node-markdown').Markdown;
    res.render('blog/entry', { content: md('' + require('fs').readFileSync('./public/blog/' + req.params.year + "/" + req.params.month + "/" + req.params.day + "/" + req.params.title + ".markdown")), title: req.params.title });
  }

  functions
  return functions;
}