const express = require('express');
const router = express.Router();
const { getActivityLogs, getRecentActivity, clearActivityLogs } = require('../controllers/activityLogController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, adminOnly, getActivityLogs);
router.get('/recent', protect, getRecentActivity);
router.delete('/', protect, adminOnly, clearActivityLogs);

module.exports = router;
