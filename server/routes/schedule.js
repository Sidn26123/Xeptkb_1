const express = require('express');
const router = express.Router();
const scheduleController = require('../controller/scheduleController');
const scheduleInstanceController = require('../controller/scheduleInstanceController');
const { verifyToken, authorize } = require('../middleware/auth');
const manualController = require("../controller/manualScheduleController");
router.post('/filter', verifyToken, authorize('admin'), scheduleController.getSchedulesByFilter);
router.get('/formatted', verifyToken, authorize('admin'), scheduleController.getFormattedSchedules);
// router.post('/save', verifyToken, authorize('admin'), scheduleController.createScheduleWithDB);

/**
 * @route   POST /api/schedules/save
 * @desc    Lưu schedule từ API response vào database
 * @access  Admin only
 */
router.post('/save', verifyToken, authorize('admin'), scheduleController.saveSchedule);
router.get('/manual/grid',verifyToken, authorize('admin'), manualController.getManualGridData);
router.post('/manual/check', verifyToken, authorize('admin'), manualController.checkConflict);
router.post('/manual/save', verifyToken, authorize('admin'), scheduleController.saveManualSchedule);
/**
 * @route   GET /api/schedules/generations
 * @desc    Lấy tất cả schedule generations
 * @access  Admin only
 */
router.get('/generations', verifyToken, authorize('admin'), scheduleController.getAllGenerations);

/**
 * @route   GET /api/schedules/generations/:id
 * @desc    Lấy thông tin một schedule generation
 * @access  Admin only
 */
router.get('/generations/:id', verifyToken, authorize('admin'), scheduleController.getGenerationById);

/**
 * @route   GET /api/schedules/generations/:id/stats
 * @desc    Lấy thống kê của một generation
 * @access  Admin only
 */
router.get('/generations/:id/stats', verifyToken, authorize('admin'), scheduleController.getGenerationStats);

/**
 * @route   GET /api/schedules/generations/:id/export
 * @desc    Export generation ra JSON
 * @access  Admin only
 */
router.get('/generations/:id/export', verifyToken, authorize('admin'), scheduleController.exportGeneration);

/**
 * @route   POST /api/schedules/generations/compare
 * @desc    So sánh nhiều generations
 * @access  Admin only
 */
router.post('/generations/compare', verifyToken, authorize('admin'), scheduleController.compareGenerations);

/**
 * @route   GET /api/schedules/semesters/:semesterId/generations
 * @desc    Lấy tất cả generations của một học kỳ
 * @access  Admin only
 */
router.get('/semesters/:semesterId/generations', verifyToken, authorize('admin'), scheduleController.getGenerationsBySemester);

/**
 * @route   DELETE /api/schedules/generations/:id
 * @desc    Xóa một schedule generation
 * @access  Admin only
 */
router.delete('/generations/:id', verifyToken, authorize('admin'), scheduleController.deleteGeneration);
router.post('/schedule', verifyToken, authorize('admin'), scheduleController.createScheduleWithDB);
router.post('/save-manual', verifyToken, authorize('admin'), scheduleController.saveManualSchedule);
router.get('/', verifyToken, authorize('admin'), scheduleController.getAllSchedules);
router.get('/:id', verifyToken, authorize('admin'), scheduleController.getScheduleById);
router.post('/', verifyToken, authorize('admin'), scheduleController.createSchedule);
router.put('/:id', verifyToken, authorize('admin'), scheduleController.updateSchedule);
router.delete('/:id', verifyToken, authorize('admin'), scheduleController.deleteSchedule);
module.exports = router;