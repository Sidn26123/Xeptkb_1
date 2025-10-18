const express = require('express');
const router = express.Router();
const teachingController = require('../controller/teachingController');
const { verifyToken, authorize } = require('../middleware/auth');

router.get('/', verifyToken, authorize('admin'), teachingController.getAllTeachings);
router.get('/:id', verifyToken, authorize('admin'), teachingController.getTeachingById);
router.post('/', verifyToken, authorize('admin'), teachingController.createTeaching);
router.put('/:id', verifyToken, authorize('admin'), teachingController.updateTeaching);
router.delete('/:id', verifyToken, authorize('admin'), teachingController.deleteTeaching);

module.exports = router;