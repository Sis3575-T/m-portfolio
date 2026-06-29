const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getTranslations,
  getLanguages,
  getByNamespace,
  getTranslationByKey,
  createTranslation,
  updateTranslation,
  deleteTranslation,
  importTranslations,
} = require('../controllers/translationController');

router.get('/:key', getTranslationByKey);

router.use(protect);

router.get('/', getTranslations);
router.get('/languages', getLanguages);
router.get('/namespace/:ns', getByNamespace);
router.post('/', adminOnly, createTranslation);
router.put('/:id', adminOnly, updateTranslation);
router.delete('/:id', adminOnly, deleteTranslation);
router.post('/import', adminOnly, importTranslations);

module.exports = router;
