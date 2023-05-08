const pageController = {};

pageController.getIndexPage = (req, res) => {
    if(!req.session.loggedUser) {
        res.redirect('/login');
    }
    else {
        const data = {
            title : 'realtime chat app',
            user : req.session.loggedUser,
            room : req.session.room
        }
        res.render('index', {data});
    }
}

pageController.getLoginPage = (req, res) => {
    res.render('login', {title : 'login - realtime chat app'});
}

module.exports = pageController;