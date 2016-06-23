module.exports = function () {
    var md = require('node-markdown').Markdown, fs = require('fs');
    var functions = {};

    functions.index = function (req, res) {
        res.render('blog/index', {title: 'Entries', user: req.user, blogs: {}});
    }

    //List of articles
    functions.list = function (req, res) {
        getFiles(function (files) {
            getPreview(files, 10, function (blogs) {
                res.json({blogs: blogs});
            })
        });
    };

    functions.entry = function (req, res) {
        res.render('blog/entry', {
            content: md('' + fs.readFileSync('./public/blog/' + req.params.year + "/" + req.params.month + "/" + req.params.day + "/" + req.params.title + ".markdown")),
            title: req.params.title
        });
    }

    //Load the articles preview
    function getPreview(blogs, qty, callback) {
        for (var i = 0; i < qty && i < blogs.length; i++) {
            var html = md('' + fs.readFileSync(blogs[i].localUrl + '.markdown'));
            blogs[i].preview = html.substring(0, 400);
        }
        callback(blogs);
    }

    //Return the articles names
    function getFiles(callback) {
        var directory = '../public/blog';
        var walk = require('walk'), fs = require('fs'), options, walker;
        var walker = walk.walk('./public/blog', {followLinks: false});

        var fs = [];

        walker.on("file", function (root, file, next) {
            var fileDir = "public/blog";
            var f = root + "/" + file['name'].substring(0, file['name'].lastIndexOf('.'));

            if (f.toLowerCase() != ("./" + fileDir + '/').toLowerCase()) {
                var localUrl = f;
                var date = f.replace("./public/blog/", "").replace(new RegExp('/', 'g'), ":");
                var name = date.substring(date.lastIndexOf(':') + 1, date.length);
                date = date.substring(0, date.lastIndexOf(':')).replace(new RegExp(':', 'g'), "-");

                // push without /blog prefix
                if (name.length > 0 && date.length > 0)
                    fs.push({url: f.substring(f.indexOf('/')), date: date, name: name, localUrl: localUrl});
            }
            next();
        });

        walker.on("end", function () {
            callback(fs);
        });
    }

    return functions;
}