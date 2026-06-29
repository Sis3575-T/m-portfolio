const router = require('express').Router();
const {
  getDashboardStats, getVisitorStats, getVisitorLocations,
  getDeviceStats, getBrowserStats, getOSStats, getPageStats,
  getReferrerStats, getSessionStats, getActiveVisitors, getLiveFeed,
  getVisitorDetails, getProjectAnalytics, getResumeAnalytics,
  getContactAnalytics, getAnalyticsOverview,
  trackVisit, trackAction, endSession, getExportData,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

// Public tracking endpoints (no auth required)
router.post('/track/visit', trackVisit);
router.post('/track/action', trackAction);
router.post('/track/end-session', endSession);

// Admin protected endpoints
router.get('/dashboard', protect, getDashboardStats);
router.get('/visitors', protect, getVisitorStats);
router.get('/locations', protect, getVisitorLocations);
router.get('/devices', protect, getDeviceStats);
router.get('/browsers', protect, getBrowserStats);
router.get('/os', protect, getOSStats);
router.get('/pages', protect, getPageStats);
router.get('/referrers', protect, getReferrerStats);
router.get('/sessions', protect, getSessionStats);
router.get('/active', protect, getActiveVisitors);
router.get('/live-feed', protect, getLiveFeed);
router.get('/visitor-details', protect, getVisitorDetails);
router.get('/projects', protect, getProjectAnalytics);
router.get('/resume', protect, getResumeAnalytics);
router.get('/contact', protect, getContactAnalytics);
router.get('/overview', protect, getAnalyticsOverview);
router.get('/export', protect, getExportData);

module.exports = router;
