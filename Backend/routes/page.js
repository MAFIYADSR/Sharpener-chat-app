const router = require('express').Router();

const pageController = require('../controllers/pages');

router.get('/meetme', pageController.sendChatPage);
router.get('/',pageController.sendMainPage);


module.exports = router;