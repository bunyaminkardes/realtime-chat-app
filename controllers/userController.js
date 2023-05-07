const userController = {};
const data = require("../data.js");

userController.login = (req, res) => {
    const isUserExist = data.katilimcilar.find((katilimci) => katilimci.name === req.body.kullaniciAdi);
    if(!isUserExist) {
        req.session.loggedUser = req.body.kullaniciAdi;
        res.redirect('/');
    }
    else {
        res.send('BÖYLE BİR KULLANICI ŞU AN VAR. BAŞKA İSİM SEÇ PLS.');
    }
}

userController.logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
}

module.exports = userController;