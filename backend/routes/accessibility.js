const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getIssues,
  getSummary,
  createIssue,
  runAudit,
  updateIssue,
  markAsFixed,
  deleteIssue,
} = require('../controllers/accessibilityController');

router.use(protect);

router.get('/', getIssues);
router.get('/summary', getSummary);
router.post('/', createIssue);
router.post('/audit', runAudit);
router.put('/:id', updateIssue);
router.patch('/:id/fix', markAsFixed);
router.delete('/:id', deleteIssue);

module.exports = router;
