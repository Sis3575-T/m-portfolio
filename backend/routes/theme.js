const express = require('express');
const router = express.Router();
const Theme = require('../models/Theme');
const { getThemes, getActiveTheme, createTheme, updateTheme, activateTheme, deleteTheme, duplicateTheme } = require('../controllers/themeController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/active', getActiveTheme);
router.get('/', protect, adminOnly, getThemes);
router.post('/', protect, adminOnly, createTheme);
router.put('/:id', protect, adminOnly, updateTheme);
router.post('/:id/activate', protect, adminOnly, activateTheme);
router.post('/:id/duplicate', protect, adminOnly, duplicateTheme);
router.delete('/:id', protect, adminOnly, deleteTheme);
router.post('/reset', protect, adminOnly, async (req, res) => {
  try {
    await Theme.deleteMany({});
    const theme = await Theme.create({ name: 'Default Theme', isActive: true });
    res.json({ success: true, data: theme, message: 'Theme reset to default' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
