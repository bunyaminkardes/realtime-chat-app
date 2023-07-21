const pageController = require("../controllers/pageController.js");
const router = require("express").Router();

router.get('/', pageController.getIndexPage);
router.get('/login', pageController.getLoginPage);

module.exports = router;