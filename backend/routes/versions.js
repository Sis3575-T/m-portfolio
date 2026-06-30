const express = require('express');
const router = express.Router();
const { getVersions, getVersion, restoreVersion, compareVersions } = require('../controllers/versionController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/:resource/:resourceId', protect, getVersions);
router.get('/:id', protect, getVersion);
router.post('/:id/restore', protect, adminOnly, restoreVersion);
router.get('/compare/:id1/:id2', protect, compareVersions);

module.exports = router;
