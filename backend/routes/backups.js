const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const {
  getBackups, createBackup, restoreBackup, deleteBackup, exportData, importData,
} = require('../controllers/backupController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.use(protect);

router.get('/', getBackups);
router.post('/', createBackup);
router.post('/:id/restore', restoreBackup);
router.delete('/:id', deleteBackup);
router.get('/export/:type', exportData);
router.post('/import', upload.single('file'), importData);

module.exports = router;
