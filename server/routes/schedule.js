const express = require('express');
const router = express.Router();
const scheduleController = require('../controller/scheduleController');
const scheduleInstanceController = require('../controller/scheduleInstanceController');
const { verifyToken, authorize } = require('../middleware/auth');
router.post('/schedule-gen/v1', verifyToken, authorize('admin'), scheduleInstanceController.saveGeneratedSchedule);
router.post('/filter', verifyToken, authorize('admin'), scheduleController.getSchedulesByFilter);
router.get('/formatted', verifyToken, authorize('admin'), scheduleController.getFormattedSchedules);
router.post('/save', verifyToken, authorize('admin'), scheduleController.createScheduleWithDB);
router.post('/schedule', verifyToken, authorize('admin'), scheduleController.createScheduleWithDB);
router.get('/', verifyToken, authorize('admin'), scheduleController.getAllSchedules);
router.get('/:id', verifyToken, authorize('admin'), scheduleController.getScheduleById);
router.post('/', verifyToken, authorize('admin'), scheduleController.createSchedule);
router.put('/:id', verifyToken, authorize('admin'), scheduleController.updateSchedule);
router.delete('/:id', verifyToken, authorize('admin'), scheduleController.deleteSchedule);

module.exports = router;