const express = require('express');
const router = express.Router();
const scheduleController = require('../controller/scheduleController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), scheduleController.getAllSchedules);
router.get('/:id', verifyToken, authorize('admin'), scheduleController.getScheduleById);
router.post('/', verifyToken, authorize('admin'), scheduleController.createSchedule);
router.put('/:id', verifyToken, authorize('admin'), scheduleController.updateSchedule);
router.delete('/:id', verifyToken, authorize('admin'), scheduleController.deleteSchedule);

module.exports = router;