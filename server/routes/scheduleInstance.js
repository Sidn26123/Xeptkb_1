const express = require('express');
const router = express.Router();
const scheduleInstanceController = require('../controller/scheduleInstanceController');
const scheduleChangeController = require('../controller/scheduleChangeController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateProposeChange, validateProposeRoomChange, validateApplyChange } = require('../validators/scheduleChangeValidator');
const {getScheduleInstancesByQuery} = require("../controller/scheduleInstanceController");

/**
* @route   POST /api/schedules/:scheduleId/instances/generate
* @desc    Tạo instances cho một schedule cụ thể
* @access  Admin only
*/
router.post('/:scheduleId/instances/generate', verifyToken, authorize('admin'), scheduleInstanceController.generateInstancesForSchedule);
router.post('/:generationId/instances/generate-all', verifyToken, authorize('admin'), scheduleInstanceController.generateInstancesForGeneration);

router.get('/query', getScheduleInstancesByQuery);

// Unified endpoint for student/teacher to fetch their schedule
router.post('/instances/daily', verifyToken, authorize('admin', 'teacher', 'student'), scheduleInstanceController.getInstancesForUser);

/**
 * @route   POST /api/schedules/generations/:generationId/instances/generate-all
 * @desc    Tạo tất cả instances cho một generation (toàn bộ học kỳ)
 * @access  Admin only
 */
router.post('/generations/:generationId/instances/generate-all', verifyToken, authorize('admin'), scheduleInstanceController.generateAllInstances);

// ==================== INSTANCE QUERY ROUTES ====================

/**
 * @route   POST /api/schedules/instances/filter
 * @desc    Lấy tất cả instances với filter
 * @access  Admin, Teacher, Student
 */
router.post('/instances/filter', verifyToken, authorize('admin', 'teacher', 'student'), scheduleInstanceController.getAllInstances);

/**
 * @route   GET /api/schedules/:scheduleId/instances
 * @desc    Lấy instances của một schedule trong khoảng thời gian
 * @access  Admin, Teacher
 */
router.get('/:scheduleId/instances', verifyToken, authorize('admin', 'teacher'), scheduleInstanceController.getInstancesBySchedule);

/**
 * @route   GET /api/schedules/instances/:instanceId
 * @desc    Lấy chi tiết một instance
 * @access  Admin, Teacher, Student
 */
router.get('/instances/:instanceId', verifyToken, authorize('admin', 'teacher', 'student'), scheduleInstanceController.getInstanceById);

// ==================== INSTANCE MODIFICATION ROUTES ====================

/**
 * @route   PUT /api/schedules/instances/:instanceId
 * @desc    Cập nhật một instance
 * @access  Admin, Teacher
 */
router.put('/instances/:instanceId', verifyToken, authorize('admin', 'teacher'), scheduleInstanceController.updateInstance);

/**
 * @route   POST /api/schedules/instances/:instanceId/cancel
 * @desc    Hủy một buổi học
 * @access  Admin, Teacher
 */
router.post('/instances/:instanceId/cancel', verifyToken, authorize('admin', 'teacher'), scheduleInstanceController.cancelInstance);

/**
 * @route   POST /api/schedules/instances/:instanceId/reschedule
 * @desc    Đổi lịch một buổi học
 * @access  Admin only
 */
router.post('/instances/:instanceId/reschedule', verifyToken, authorize('admin'), scheduleInstanceController.rescheduleInstanceHandler);

/**
 * @route   POST /api/schedules/instances/:instanceId/complete
 * @desc    Đánh dấu buổi học đã hoàn thành
 * @access  Admin, Teacher
 */
router.post('/instances/:instanceId/complete', verifyToken, authorize('admin', 'teacher'), scheduleInstanceController.completeInstance);

// New endpoints split by mode:
// - /propose-change/room : find alternative rooms at a fixed timeslot
router.post('/propose-change/room', verifyToken, authorize('admin', 'teacher'), validateProposeRoomChange, scheduleChangeController.proposeRoomChange);
// - /propose-change/time : find time+room alternatives (same as existing behavior)
router.post('/propose-change/time', verifyToken, authorize('admin', 'teacher'), validateProposeChange, scheduleChangeController.proposeTimeChange);

/**
 * @route   POST /api/schedule-instances/apply-change
 * @desc    Áp dụng thay đổi lịch đã chọn
 * @access  Admin, Teacher (chỉ đổi lớp của mình)
 */
router.post('/apply-change', verifyToken, authorize('admin', 'teacher'), validateApplyChange, scheduleChangeController.applyScheduleChange);

router.get('/:id', verifyToken, authorize('admin', 'teacher', 'student'), scheduleInstanceController.getInstanceById);
module.exports = router;
