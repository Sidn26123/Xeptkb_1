const express = require('express');
const router = express.Router();
const scheduleInstanceController = require('./scheduleInstanceController');
const { verifyToken, authorize } = require('../middleware/auth');

// Generate instances (preview or persist)
router.post('/generate', verifyToken, authorize('admin'), scheduleInstanceController.generateInstances);
// List / query schedule instances
router.get('/', verifyToken, authorize('admin'), scheduleInstanceController.getInstances);

module.exports = router;
