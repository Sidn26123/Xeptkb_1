const express = require('express');
const router = express.Router();
const studentController = require('../controller/studentController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), studentController.getAllStudents);
router.get('/:id', verifyToken, authorize('admin'), studentController.getStudentById);
router.post('/', verifyToken, authorize('admin'), studentController.createStudent);
router.put('/:id', verifyToken, authorize('admin'), studentController.updateStudent);
router.delete('/:id', verifyToken, authorize('admin'), studentController.deleteStudent);

module.exports = router;