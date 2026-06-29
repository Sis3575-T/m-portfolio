const router = require('express').Router();
const {
  getAbout, getAboutById, createAbout, updateAbout, deleteAbout,
} = require('../controllers/aboutController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/public', getAbout);
router.get('/', protect, getAbout);
router.get('/:id', protect, getAboutById);
router.post('/', protect, adminOnly, createAbout);
router.put('/:id', protect, adminOnly, updateAbout);
router.put('/', protect, adminOnly, updateAbout);
router.delete('/:id', protect, adminOnly, deleteAbout);

module.exports = router;
