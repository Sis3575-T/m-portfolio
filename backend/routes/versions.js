const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getVersions,
  getVersionById,
  compareVersions,
  restoreVersion,
  deleteVersion,
} = require('../controllers/versionController');

router.use(protect);

router.get('/', getVersions);
router.get('/:id', getVersionById);
router.post('/compare', compareVersions);
router.post('/:id/restore', adminOnly, restoreVersion);
router.delete('/:id', adminOnly, deleteVersion);

module.exports = router;
