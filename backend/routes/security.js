const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getLoginHistory,
  getFailedAttempts,
  getLoginStats,
  clearLoginHistory,
} = require('../controllers/securityController');

router.use(protect);

router.get('/login-history', getLoginHistory);
router.get('/failed-attempts', getFailedAttempts);
router.get('/stats', getLoginStats);
router.delete('/login-history', adminOnly, clearLoginHistory);

module.exports = router;
