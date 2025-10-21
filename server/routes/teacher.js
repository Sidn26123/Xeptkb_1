// const express = require('express');
// const router = express.Router();
// const teacherController = require('../controller/teacherController');
// const { verifyToken, authorize } = require('../middleware/auth');
//
// router.get('/', verifyToken, authorize('admin'), teacherController.getAllTeachers);
// router.get('/:id', verifyToken, authorize('admin'), teacherController.getTeacherById);
// router.post('/', verifyToken, authorize('admin'), teacherController.createTeacher);
// router.put('/:id', verifyToken, authorize('admin'), teacherController.updateTeacher);
// router.delete('/:id', verifyToken, authorize('admin'), teacherController.deleteTeacher);
//
// module.exports = router;

const express = require('express');
const router = express.Router();
const teacherController = require('../controller/teacherController');
const { validateTeacher } = require('../validators/teacherValidator');
const { validateRequest } = require('../middleware/validate');

router.post('/', validateTeacher, validateRequest, teacherController.createTeacher);
router.put('/:id', validateTeacher, validateRequest, teacherController.updateTeacher);
router.get('/', teacherController.getAllTeachers);
router.get('/:id', teacherController.getTeacherById);
router.delete('/:id', teacherController.deleteTeacher);

module.exports = router;
