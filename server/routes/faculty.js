const express = require('express');
const router = express.Router();
const facultyController = require('../controller/facultyController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), facultyController.getAllFaculties);
router.get('/:id', verifyToken, authorize('admin'), facultyController.getFacultyById);
router.post('/', verifyToken, authorize('admin'), facultyController.createFaculty);
router.put('/:id', verifyToken, authorize('admin'), facultyController.updateFaculty);
router.delete('/:id', verifyToken, authorize('admin'), facultyController.deleteFaculty);

module.exports = router;