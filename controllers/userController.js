const userController = {};
const data = require("../data.js");

userController.login = (req, res) => {
    const isUserExist = data.katilimcilar.find((katilimci) => katilimci.kullaniciAdi === req.body.kullaniciAdi);
    if(!isUserExist) { //seçilmemiş bir kullanıcı adı input olarak girildiyse login yap, redirect et.
        if(req.body.oda !== "") { //oda seçimi yapılmış olmalı.
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

userController.logOut = (req, res) => { //tüm sessionları destroy et.
    req.session.destroy();
    res.redirect('/login');
}

module.exports = userController;