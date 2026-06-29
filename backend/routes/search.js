const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  searchAll,
  searchProjects,
  searchBlogs,
  searchPages,
  adminSearch,
} = require('../controllers/searchController');

router.get('/all', searchAll);
router.get('/projects', searchProjects);
router.get('/blogs', searchBlogs);
router.get('/pages', searchPages);
router.get('/admin', protect, adminSearch);

module.exports = router;
