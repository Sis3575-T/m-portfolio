const router = require('express').Router();
const { 
  login, getMe, updateProfile, changePassword, refreshToken, logout,
  updatePreferences, updateNotifications,
  getSessions, terminateSession, terminateOtherSessions, logoutAllSessions,
  connectAccount, disconnectAccount, deleteAccount, deactivateAccount,
  updateTwoFactor,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('photo'), updateProfile);
router.put('/change-password', protect, changePassword);
router.put('/preferences', protect, updatePreferences);
router.put('/notifications', protect, updateNotifications);
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:id', protect, terminateSession);
router.post('/sessions/terminate-other', protect, terminateOtherSessions);
router.post('/sessions/logout-all', protect, logoutAllSessions);
router.post('/connect/:provider', protect, connectAccount);
router.delete('/connect/:provider', protect, disconnectAccount);
router.delete('/account', protect, deleteAccount);
router.post('/deactivate', protect, deactivateAccount);
router.put('/two-factor', protect, updateTwoFactor);
router.post('/reset', async (req, res) => {
  try {
    const User = require('../models/User');
    await User.deleteMany({ role: 'admin' });
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      return res.status(400).json({ success: false, message: 'ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env' });
    }
    const user = await User.create({
      name: 'Admin',
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role: 'admin',
    });
    res.json({ success: true, message: 'Admin re-seeded', email: user.email });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
