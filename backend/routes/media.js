const router = require('express').Router();
const {
  getMedia, getMediaById, uploadMedia, updateMedia, deleteMedia, getMediaStats, getFolders,
} = require('../controllers/mediaController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/stats', protect, getMediaStats);
router.get('/folders', protect, getFolders);
router.get('/', protect, getMedia);
router.get('/:id', protect, getMediaById);
router.post('/upload', protect, adminOnly, upload.single('file'), uploadMedia);
router.put('/:id', protect, adminOnly, updateMedia);
router.delete('/:id', protect, adminOnly, deleteMedia);

module.exports = router;
