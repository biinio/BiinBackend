var category = require('../../models/category');
//Post categories
exports.setCategories = function (req, res) {
    var catetories = [{identifier: "category1", name: "personalcare", displayName: "Personal Care", icon: "weigh"},
        {identifier: "category2", name: "vacations", displayName: "Vacations", icon: "beach"},
        {identifier: "category3", name: "shoes", displayName: "Shoes", icon: "sneakers"},
        {identifier: "category4", name: "games", displayName: "Games", icon: "virus"},
        {identifier: "category5", name: "outdoors", displayName: "Outdoors", icon: "leaf"},
        {identifier: "category6", name: "health", displayName: "Health", icon: "drug"},
        {identifier: "category7", name: "food", displayName: "Food", icon: "burger-1"},
        {identifier: "category8", name: "sports", displayName: "Sports", icon: "bike-helmet"},
        {identifier: "category9", name: "education", displayName: "Education", icon: "academic-cap"},
        {identifier: "category10", name: "fashion", displayName: "Fashion", icon: "cloth-hanger"},
        {identifier: "category11", name: "music", displayName: "Music", icon: "notes-1"},
        {identifier: "category12", name: "movies", displayName: "Movies", icon: "ticket-2"},
        {identifier: "category13", name: "technology", displayName: "Technology", icon: "television"},
        {identifier: "category14", name: "entertaiment", displayName: "Entertaiment", icon: "smileys"},
        {identifier: "category15", name: "travel", displayName: "Travel", icon: "ship"},
        {identifier: "category16", name: "bars", displayName: "Bars", icon: "beer"}
    ];

    //Insert of castegories
    category.create(catetories, function (err) {
        if (err)
            throw err;
        else
            console.log("Success");
    });
}


//GET the list of biins
exports.listCategories = function (req, res) {
    category.find({}, function (err, data) {
        res.json({data: data});
    });
}