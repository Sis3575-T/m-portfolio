const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getTheme, updateTheme, resetTheme } = require('../controllers/themeController');

router.use(protect);

router.get('/', getTheme);
router.put('/', updateTheme);
router.post('/reset', resetTheme);

module.exports = router;
