const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
    createStudentValidator,
    updateStudentValidator
} = require('../validators/studentValidator');

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

module.exports = router;
