const express = require('express');
const router = express.Router();
const classController = require('../controller/classController');

const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
    createClassValidator,
    updateClassValidator
} = require('../validators/classValidator');
const {body} = require("express-validator");

// Lấy tất cả lớp học
router.get('/', classController.getAllClasses);
router.post(
    '/bulk-import',
    verifyToken,
    authorize('admin'),
    [
        // Validate nhanh: Bắt buộc body phải là Array và không rỗng
        body().isArray({ min: 1 }).withMessage('Dữ liệu gửi lên phải là một danh sách và không được để trống')
    ],
    validateRequest,
    classController.bulkImportClasses
)
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
router.delete('/:id',verifyToken,authorize('admin'), classController.deleteClass);

module.exports = router;