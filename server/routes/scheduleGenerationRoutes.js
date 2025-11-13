const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middleware/auth');
const scheduleGenerationController = require('../controller/scheduleGenerationController');

// Tạo mới record ScheduleGeneration
router.post(
    '',
    verifyToken,
    authorize('admin'),
    scheduleGenerationController.createScheduleGeneration
);

// Lọc + sort + pagination
router.post(
    '/filter',
    verifyToken,
    authorize('admin'),
    scheduleGenerationController.filterScheduleGenerations
);

// Lấy tất cả
router.get(
    '',
    verifyToken,
    authorize('admin'),
    scheduleGenerationController.getAllScheduleGenerations
);

// Lấy chi tiết theo ID
router.get(
    '/:id',
    verifyToken,
    authorize('admin'),
    scheduleGenerationController.getScheduleGenerationById
);

// Xóa record
router.delete(
    '/:id',
    verifyToken,
    authorize('admin'),
    scheduleGenerationController.deleteScheduleGeneration
);

module.exports = router;
