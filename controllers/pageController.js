const pageController = {};

pageController.getIndexPage = (req, res) => {
    if(!req.session.loggedUser) {
        res.redirect('/login');
    }
    else {
        res.render('index', {title : 'realtime chat app', user : req.session.loggedUser});
    }
}

pageController.getLoginPage = (req, res) => {
    res.render('login', {title : 'login - realtime chat app'});
}

module.exports = pageController;