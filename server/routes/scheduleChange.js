const express = require('express');
const router = express.Router();
const scheduleChangeController = require('../controller/scheduleChangeController');
const { verifyToken, authorize } = require('../middleware/auth');

// Teacher creates a request
router.post('/', verifyToken, authorize('teacher','admin'), scheduleChangeController.create);

// List requests (admin or teacher - teacher will typically be limited on backend by filters)
router.get('/', verifyToken, authorize('admin','teacher'), scheduleChangeController.list);

// Get request
router.get('/:id', verifyToken, authorize('admin','teacher'), scheduleChangeController.getById);

// Approve (admin)
router.post('/:id/approve', verifyToken, authorize('admin'), scheduleChangeController.approve);

// Apply approved request (admin)
router.post('/:id/apply', verifyToken, authorize('admin'), scheduleChangeController.apply);

// Reject request (admin)
router.post('/:id/reject', verifyToken, authorize('admin'), scheduleChangeController.reject);

module.exports = router;
