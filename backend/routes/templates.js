const express = require('express');
const router = express.Router();
const { getTemplates, createTemplate, updateTemplate, deleteTemplate, duplicateTemplate, exportTemplate, importTemplate } = require('../controllers/templateController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, getTemplates);
router.post('/', protect, adminOnly, createTemplate);
router.put('/:id', protect, adminOnly, updateTemplate);
router.delete('/:id', protect, adminOnly, deleteTemplate);
router.post('/:id/duplicate', protect, adminOnly, duplicateTemplate);
router.get('/:id/export', protect, exportTemplate);
router.post('/import', protect, adminOnly, importTemplate);

module.exports = router;
