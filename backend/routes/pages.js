const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Page = require('../models/Page');
const {
  getPages, createPage, updatePage, deletePage,
  duplicatePage, reorderPages, togglePage,
  getComponents, addComponent, updateComponent, deleteComponent,
  duplicateComponent, reorderComponents, toggleComponent, moveComponent,
} = require('../controllers/pageController');

// Public routes (no auth required)
router.get('/home', async (req, res) => {
  try {
    const page = await Page.findOne({ isHome: true, isPublished: true });
    if (!page) return res.json({ success: true, data: null });
    const components = page.components
      .filter(c => c.isVisible)
      .sort((a, b) => a.order - b.order);
    res.json({ success: true, data: { ...page.toObject(), components } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/slug/:slug', async (req, res) => {
  try {
    const page = await Page.findOne({ slug: req.params.slug, isPublished: true });
    if (!page) return res.json({ success: true, data: null });
    const components = page.components
      .filter(c => c.isVisible)
      .sort((a, b) => a.order - b.order);
    res.json({ success: true, data: { ...page.toObject(), components } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// All routes below require auth
router.use(protect);

router.route('/')
  .get(getPages)
  .post(createPage);

router.put('/reorder', reorderPages);

router.route('/:id')
  .put(updatePage)
  .delete(deletePage);

router.post('/:id/duplicate', duplicatePage);
router.patch('/:id/toggle', togglePage);

// Component routes
router.get('/:pageId/components', getComponents);
router.post('/:pageId/components', addComponent);
router.put('/:pageId/components/reorder', reorderComponents);

router.route('/:pageId/components/:componentId')
  .put(updateComponent)
  .delete(deleteComponent);

router.post('/:pageId/components/:componentId/duplicate', duplicateComponent);
router.patch('/:pageId/components/:componentId/toggle', toggleComponent);
router.post('/:pageId/components/:componentId/move', moveComponent);

module.exports = router;
