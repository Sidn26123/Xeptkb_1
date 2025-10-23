const express = require('express');
const router = express.Router();
const facultyController = require('../controller/facultyController');
const { verifyToken, authorize } = require('../middleware/auth');
const { validateFaculty } = require('../validators/facultyValidator');
const { validateRequest } = require('../middleware/validate');
router.get('/', verifyToken, authorize('admin'), facultyController.getAllFaculties);
router.get('/:id', verifyToken, authorize('admin'), facultyController.getFacultyById);
router.post(
    '/',
    verifyToken,
    authorize('admin'),
    validateFaculty,
    validateRequest,
    facultyController.createFaculty
);

// Cập nhật khoa (validate input)
router.put(
    '/:id',
    verifyToken,
    authorize('admin'),
    validateFaculty,
    validateRequest,
    facultyController.updateFaculty
);
router.delete('/:id', verifyToken, authorize('admin'), facultyController.deleteFaculty);

module.exports = router;