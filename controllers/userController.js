const userController = {};

userController.login = (req, res) => {
    req.session.loggedUser = req.body.kullaniciAdi;
    res.redirect('/');
}

userController.logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
}

module.exports = userController;