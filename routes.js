const pageController = require("./controllers/pageController.js");
const userController = require("./controllers/userController.js");
const router = require("express").Router();

router.get('/', pageController.getIndexPage);
router.get('/login', pageController.getLoginPage);

router.get('/logout', userController.logOut);
router.post('/login', userController.login);

module.exports = router;