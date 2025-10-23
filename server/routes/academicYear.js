const express = require('express');
const router = express.Router();
const academicYearController = require('../controller/academicYearController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
    createAcademicYearValidator,
    updateAcademicYearValidator
} = require('../validators/academicYearValidator');
router.get('/', verifyToken, authorize('admin'), academicYearController.getAllAcademicYears);
router.get('/:id', verifyToken, authorize('admin'), academicYearController.getAcademicYearById);

// Tạo mới năm học
router.post(
    '/',
    verifyToken,
    authorize('admin'),
    createAcademicYearValidator,
    validateRequest,
    academicYearController.createAcademicYear
);

// Cập nhật năm học
router.put(
    '/:id',
    verifyToken,
    authorize('admin'),
    updateAcademicYearValidator,
    validateRequest,
    academicYearController.updateAcademicYear
);
router.delete('/:id', verifyToken, authorize('admin'), academicYearController.deleteAcademicYear);

module.exports = router;