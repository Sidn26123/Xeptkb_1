const express = require('express');
const router = express.Router();
const semesterController = require('../controller/semesterController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const {
    createSemesterValidator,
    updateSemesterValidator
} = require('../validators/semesterValidator');
router.get('/', verifyToken, authorize('admin'), semesterController.getAllSemesters);
router.get('/:id', verifyToken, authorize('admin'), semesterController.getSemesterById);
router.post(
    '/',
    verifyToken,
    authorize('admin'),
    createSemesterValidator,
    validateRequest,
    semesterController.createSemester
);
router.put(
    '/',
    verifyToken,
    authorize('admin'),
    updateSemesterValidator,
    validateRequest,
    semesterController.updateSemester
);
router.delete('/:id', verifyToken, authorize('admin'), semesterController.deleteSemester);

module.exports = router;