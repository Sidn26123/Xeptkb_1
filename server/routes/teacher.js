// Router cho teacher site
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { teacherTest } = require('../controller/teacherController');

router.get('/', verifyToken, authorize('teacher'), teacherTest);

module.exports = router;