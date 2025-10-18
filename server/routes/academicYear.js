const express = require('express');
const router = express.Router();
const academicYearController = require('../controller/academicYearController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), academicYearController.getAllAcademicYears);
router.get('/:id', verifyToken, authorize('admin'), academicYearController.getAcademicYearById);
router.post('/', verifyToken, authorize('admin'), academicYearController.createAcademicYear);
router.put('/:id', verifyToken, authorize('admin'), academicYearController.updateAcademicYear);
router.delete('/:id', verifyToken, authorize('admin'), academicYearController.deleteAcademicYear);

module.exports = router;