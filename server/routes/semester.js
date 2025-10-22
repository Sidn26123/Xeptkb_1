const express = require('express');
const router = express.Router();
// const semesterController = require('../controller/semesterController');
const { verifyToken, authorize } = require('../middleware/auth');

// router.get('/', verifyToken, authorize('admin'), semesterController.getAllSemesters);
// router.get('/:id', verifyToken, authorize('admin'), semesterController.getSemesterById);
// router.post('/', verifyToken, authorize('admin'), semesterController.createSemester);
// router.put('/:id', verifyToken, authorize('admin'), semesterController.updateSemester);
// router.delete('/:id', verifyToken, authorize('admin'), semesterController.deleteSemester);

module.exports = router;