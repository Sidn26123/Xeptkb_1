const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
    createStudentValidator,
    updateStudentValidator
} = require('../validators/studentValidator');
const {body} = require("express-validator");
const classController = require("../controller/classController");

// Lấy tất cả sinh viên
router.get('/', verifyToken, authorize('admin'), studentController.getAllStudents);

// Lấy sinh viên theo ID
router.get('/:id', verifyToken, authorize('admin'), studentController.getStudentById);

// Tạo sinh viên mới
router.post(
    '/',
    verifyToken,
    authorize('admin'),
    createStudentValidator,
    validateRequest,
    studentController.createStudent
);

// Cập nhật sinh viên
router.put(
    '/:id',
    verifyToken,
    authorize('admin'),
    updateStudentValidator,
    validateRequest,
    studentController.updateStudent
);

// Xóa sinh viên
router.delete(
    '/:id',
    verifyToken,
    authorize('admin'),
    studentController.deleteStudent
);

router.post(
    '/bulk-import',
    verifyToken,
    authorize('admin'),
    [
        // Validate nhanh: Bắt buộc body phải là Array và không rỗng
        body().isArray({ min: 1 }).withMessage('Dữ liệu gửi lên phải là một danh sách và không được để trống')
    ],
    validateRequest,
    studentController.bulkImport
)
module.exports = router;
