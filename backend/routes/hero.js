const router = require('express').Router();
const {
  getHero, getHeroById, createHero, updateHero, deleteHero, toggleHero,
} = require('../controllers/heroController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/public', getHero);
router.get('/', protect, getHero);
router.get('/:id', protect, getHeroById);
router.post('/', protect, adminOnly, upload.single('avatar'), createHero);
router.put('/:id', protect, adminOnly, upload.single('avatar'), updateHero);
router.put('/', protect, adminOnly, upload.single('avatar'), updateHero);
router.delete('/:id', protect, adminOnly, deleteHero);
router.patch('/:id/toggle', protect, adminOnly, toggleHero);

module.exports = router;
