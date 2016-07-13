//Get Client List
exports.accounts = function (req, res) {
    res.render('account/index', {
        title: 'Account',
        user: req.user,
        organization: req.session.defaultOrganization,
        isSiteManteinance: true
    });
};
