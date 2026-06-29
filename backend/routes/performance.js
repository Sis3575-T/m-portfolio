const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPerformanceMetrics,
  getPerformanceSummary,
  getPagePerformance,
  getImageSizes,
  trackPerformance,
} = require('../controllers/performanceController');

router.post('/track', trackPerformance);

router.use(protect);

router.get('/', getPerformanceMetrics);
router.get('/summary', getPerformanceSummary);
router.get('/pages', getPagePerformance);
router.get('/images', getImageSizes);

module.exports = router;
