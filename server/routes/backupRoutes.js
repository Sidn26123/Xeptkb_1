const express = require('express');
const router = express.Router();
const controller = require('../controller/backupController');
const { verifyToken, authorize } = require('../middleware/auth');


router.post('/create', verifyToken, authorize('admin'), controller.createBackup);
router.get('/list', verifyToken, authorize('admin'), controller.getBackups);
router.get('/download/:filename', verifyToken, authorize('admin'), controller.downloadBackup); // Route download
router.post('/restore', verifyToken, authorize('admin'), controller.restoreBackup);
router.post('/delete', verifyToken, authorize('admin'), controller.deleteBackup);

module.exports = router;