const express = require('express');
const router = express.Router();
const classController = require('../controller/classController');

const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
    createClassValidator,
    updateClassValidator
} = require('../validators/classValidator');

// Lấy tất cả lớp học
router.get('/', classController.getAllClasses);

// Lấy lớp học theo id
router.get('/:id', classController.getClassById);

// Tạo lớp học mới
router.post(
    '/',
    verifyToken,
    authorize('admin'),
    createClassValidator,
    validateRequest,
    classController.createClass
);

// Cập nhật lớp học
router.put(
    '/:id',
    verifyToken,
    authorize('admin'),
    updateClassValidator,
    validateRequest,
    classController.updateClass
);

// Xóa lớp học
router.delete('/:id', classController.deleteClass);

module.exports = router;