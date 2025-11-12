const express = require('express');
const router = express.Router();
const scheduleInstanceController = require('../controller/scheduleInstanceController');
const { verifyToken, authorize } = require('../middleware/auth');

/**
* @route   POST /api/schedules/:scheduleId/instances/generate
* @desc    Tạo instances cho một schedule cụ thể
* @access  Admin only
*/
router.post('/:scheduleId/instances/generate', verifyToken, authorize('admin'), scheduleInstanceController.generateInstancesForSchedule);

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
 * @access  Admin only
 */
router.put('/instances/:instanceId', verifyToken, authorize('admin'), scheduleInstanceController.updateInstance);

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

/**
 * @route   DELETE /api/schedules/instances/:instanceId
 * @desc    Xóa một instance
 * @access  Admin only
 */
router.delete('/instances/:instanceId', verifyToken, authorize('admin'), scheduleInstanceController.deleteInstance);

module.exports = router;
