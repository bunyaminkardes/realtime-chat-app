const userController = require("../controllers/userController.js");
const router = require("express").Router();

router.get('/logout', userController.logOut);
router.post('/login', userController.login);

module.exports = router;