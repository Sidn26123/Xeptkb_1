// Router cho student site
const router = require('express').Router();
const { verifyToken, authorize } = require('../middleware/auth');
const { studentTest } = require('../controller/studentController');

router.get('/', verifyToken, authorize('student'), studentTest);

module.exports = router;