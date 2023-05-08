const userController = {};
const data = require("../data.js");

userController.login = (req, res) => {
    const isUserExist = data.katilimcilar.find((katilimci) => katilimci.kullaniciAdi === req.body.kullaniciAdi);
    if(!isUserExist) {
        if(req.body.oda !== "") {
            req.session.loggedUser = req.body.kullaniciAdi;
            req.session.room = req.body.oda;
            res.redirect('/');
        }
        else {
            res.send("Oda seçimi yapmanız gerekiyor.");
        }
    }
    else {
        res.send('Böyle bir kullanıcı ismi şu anlık alınmış durumda, lütfen başka bir isim seçin.');
    }
}

userController.logOut = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
}

module.exports = userController;