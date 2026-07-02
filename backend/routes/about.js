const router = require('express').Router();
const {
  getAbout, getAboutById, createAbout, updateAbout, deleteAbout,
} = require('../controllers/aboutController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/public', getAbout);
router.get('/', protect, getAbout);
router.get('/:id', protect, getAboutById);
router.post('/', protect, adminOnly, upload.none(), createAbout);
router.put('/:id', protect, adminOnly, upload.none(), updateAbout);
router.put('/', protect, adminOnly, upload.none(), updateAbout);
router.delete('/:id', protect, adminOnly, deleteAbout);

module.exports = router;
