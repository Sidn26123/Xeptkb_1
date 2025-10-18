const express = require('express');
const router = express.Router();
const subjectController = require('../controller/subjectController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), subjectController.getAllSubjects);
router.get('/:id', verifyToken, authorize('admin'), subjectController.getSubjectById);
router.post('/', verifyToken, authorize('admin'), subjectController.createSubject);
router.put('/:id', verifyToken, authorize('admin'), subjectController.updateSubject);
router.delete('/:id', verifyToken, authorize('admin'), subjectController.deleteSubject);

module.exports = router;