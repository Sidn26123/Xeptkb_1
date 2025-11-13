const express = require('express');
const router = express.Router();
const courseClassController = require('../controller/courseClassController');
const { verifyToken, authorize } = require('../middleware/auth');
router.get('/full/:id', verifyToken, authorize('admin'), courseClassController.getFullInfoCourseClassById);
router.get('/full', verifyToken, authorize('admin'), courseClassController.getAllFullInfoCourseClasses);
router.get('/', verifyToken, authorize('admin'), courseClassController.getAllCourseClasses);
router.get('/:id', verifyToken, authorize('admin'), courseClassController.getCourseClassById);
router.post('/', verifyToken, authorize('admin'), courseClassController.createCourseClass);
router.put('/:id', verifyToken, authorize('admin'), courseClassController.updateCourseClass);
router.delete('/:id', verifyToken, authorize('admin'), courseClassController.deleteCourseClass);

module.exports = router;