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
const {verifyToken, authorize} = require("../middleware/auth");

router.post('/',  verifyToken, authorize('admin'), validateTeacher, validateRequest, teacherController.createTeacher);
router.put('/:id',  verifyToken, authorize('admin'), validateTeacher, validateRequest, teacherController.updateTeacher);
router.get('/', verifyToken, authorize('admin'), teacherController.getAllTeachers);
router.get('/:id',  verifyToken, authorize('admin'), teacherController.getTeacherById);
router.delete('/:id',  verifyToken, authorize('admin'), teacherController.deleteTeacher);

module.exports = router;
