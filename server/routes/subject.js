const express = require('express');
const router = express.Router();
const subjectController = require('../controller/subjectController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
    createSubjectValidator,
    updateSubjectValidator
} = require('../validators/subjectValidator');

// Lấy tất cả môn học
router.get('/', verifyToken, authorize('admin'), subjectController.getAllSubjects);

// Lấy môn học theo ID
router.get('/:id', verifyToken, authorize('admin'), subjectController.getSubjectById);

// Tạo môn học mới
router.post(
    '/',
    verifyToken,
    authorize('admin'),
    createSubjectValidator,
    validateRequest,
    subjectController.createSubject
);

// Cập nhật môn học
router.put(
    '/:id',
    verifyToken,
    authorize('admin'),
    updateSubjectValidator,
    validateRequest,
    subjectController.updateSubject
);

// Xóa môn học
router.delete(
    '/:id',
    verifyToken,
    authorize('admin'),
    subjectController.deleteSubject
);

module.exports = router;
